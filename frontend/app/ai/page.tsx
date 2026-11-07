'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLinkedIn } from '@/contexts/LinkedInContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import api from '@/lib/api'
import { Sparkles, CheckCircle2, Send, Trash2, Image as ImageIcon, Edit2, Save, X, RefreshCw, Bell, MessageSquare, User } from 'lucide-react'
import { PaymentModal } from '@/components/web3/PaymentModal'
import { PoweredByAsi } from '@/components/brand/powered-by'
import { saveGalleryItem } from '@/lib/gallery'
import { hasVoiceKit, loadVoiceKit, voiceKitPrefix } from '@/lib/voice-kit'

interface TeamApproval {
  approved: boolean
  approved_by?: string
  approved_at?: string
  comments?: Array<{
    email: string
    comment: string
    timestamp: string
  }>
}

interface Notification {
  id: string
  message: string
  type: 'success' | 'info' | 'warning'
  timestamp: string
  read: boolean
}

interface GeneratedPost {
  text: string
  imageUrl?: string
  topic: string
  schedule_id?: string
  review_link?: string
  approval_status?: TeamApproval
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
]

export default function AIGeneratorPage() {
  const { connected } = useLinkedIn()
  const [topic, setTopic] = useState('')
  const [includeImage, setIncludeImage] = useState(true)
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [log, setLog] = useState<Array<{ msg: string; type: string; ts: string }>>([])
  const [showPostPayment, setShowPostPayment] = useState(false)
  const [showScheduleOptions, setShowScheduleOptions] = useState(false)
  const [scheduleType, setScheduleType] = useState<'once' | 'recurring'>('once')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [cronExpression, setCronExpression] = useState('')
  const [requireApproval, setRequireApproval] = useState(false)
  const [teamEmails, setTeamEmails] = useState<string[]>([''])
  const [reviewLink, setReviewLink] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [checkingApproval, setCheckingApproval] = useState(false)

  const pushLog = (msg: string, type: string = 'info') => {
    setLog((l) => [...l, { msg, type, ts: new Date().toLocaleTimeString() }])
  }

  const addNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    }
    setNotifications((prev) => [notification, ...prev])
    toast.success(message, { duration: 5000 })
  }

  const checkApprovalStatus = async (scheduleId: string) => {
    if (checkingApproval) return
    if (!scheduleId) return
    
    setCheckingApproval(true)
    try {
      // Use the new approval status endpoint
      const { data } = await api.get(`/linkedin/schedule/${scheduleId}/approval-status`)
      
      if (data.error) {
        // Silent fail for errors - don't spam console
        return
      }
      
      // Check if post has been approved
      if (data.approved && data.approved_by) {
        // Team has approved - update post state
        setGeneratedPost((prev) => prev ? {
          ...prev,
          approval_status: {
            approved: true,
            approved_by: data.approved_by,
            approved_at: data.approved_at || new Date().toISOString(),
            comments: data.comments || []
          }
        } : null)

        // Add notification
        addNotification(`✅ Team member ${data.approved_by} approved your post!`, 'success')
        pushLog(`Team approval received from ${data.approved_by}`, 'success')

        // Auto payment and post
        setShowPostPayment(true)
      } else if (data.comments && data.comments.length > 0) {
        // Update comments if any (but not approved yet)
        setGeneratedPost((prev) => prev ? {
          ...prev,
          approval_status: {
            approved: false,
            comments: data.comments
          }
        } : null)
      } else if (data.status && data.status !== 'pending_approval') {
        // Update status if changed
        setGeneratedPost((prev) => prev ? {
          ...prev,
          approval_status: {
            approved: data.status === 'pending' || data.status === 'posted',
            approved_by: data.approved_by,
            approved_at: data.approved_at,
            comments: data.comments || []
          }
        } : null)
      }
    } catch (e: any) {
      // Silent fail - don't spam errors
      if (e?.response?.status !== 404 && e?.response?.status !== 401) {
        console.error('Error checking approval status:', e)
      }
    } finally {
      setCheckingApproval(false)
    }
  }

  // Poll for approval status when review_link exists and requires approval
  useEffect(() => {
    const reviewLinkToCheck = generatedPost?.review_link || reviewLink
    if (!reviewLinkToCheck || !requireApproval) return
    if (generatedPost?.approval_status?.approved) return // Stop polling if already approved

    const scheduleId = generatedPost?.schedule_id
    if (!scheduleId) return

    // Check immediately, then poll every 10 seconds (reduced frequency to avoid spam)
    checkApprovalStatus(scheduleId)
    
    const intervalId = setInterval(() => {
      checkApprovalStatus(scheduleId)
    }, 10000) // Check every 10 seconds (reduced from 5 to avoid spam)

    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedPost?.schedule_id, generatedPost?.review_link, reviewLink, requireApproval, generatedPost?.approval_status?.approved])

  const generatePost = async () => {
    if (!connected) {
      pushLog('Please connect your LinkedIn account first', 'warning')
      toast.error('Please connect your LinkedIn account first')
      return
    }
    if (!topic.trim()) {
      pushLog('Please enter a topic', 'warning')
      toast.error('Please enter a topic')
      return
    }
    
    // No payment required for generating post - payment only required when posting to LinkedIn
    await executeGenerate()
  }

  const executeGenerate = async () => {
    setLoading(true)
    setGeneratedPost(null)
    try {
      const payload: any = { 
        topic: `${voiceKitPrefix(loadVoiceKit())}${topic}`, 
        includeImage, 
        language: language || 'en' 
      }
      
      // Add schedule options if user wants to schedule
      if (showScheduleOptions) {
        if (scheduleType === 'once' && scheduledDate && scheduledTime) {
          // Combine date and time into ISO datetime string
          const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
          payload.scheduled_at = scheduledDateTime
        } else if (scheduleType === 'recurring' && cronExpression) {
          payload.schedule = cronExpression
        }
        
        if (requireApproval) {
          payload.require_approval = true
          // Filter out empty emails
          const validEmails = teamEmails.filter(email => email.trim() !== '')
          if (validEmails.length > 0) {
            payload.team_emails = validEmails
          }
        }
      }
      
      const { data } = await api.post('/linkedin/generate-ai-post', payload)
      
      const imageUrl = data.imageUrl || data.image || data.image_url || null
      
      // Extract content from various possible response formats
      let contentText = data.text || data.post || data.content || ''
      
      // If content is an object, try to extract text from it
      if (typeof contentText === 'object' && contentText !== null) {
        contentText = contentText.text || contentText.content || JSON.stringify(contentText)
      }
      
      // Ensure content is a string
      contentText = String(contentText || '').trim()
      
      const postData: GeneratedPost = {
        text: contentText,
        imageUrl: imageUrl || undefined,
        topic: topic,
        schedule_id: data.schedule_id || undefined,
        review_link: data.review_link || undefined,
        approval_status: data.approval_status || undefined
      }
      setGeneratedPost(postData)
      setEditedText(postData.text)
      setIsEditing(false)
      if (imageUrl) {
        saveGalleryItem({ url: imageUrl, topic })
      }
      
      // Log content for debugging
      if (!contentText) {
        pushLog('Warning: No content received from API', 'warning')
      } else {
        pushLog(`Content received: ${contentText.length} characters`, 'info')
      }
      
      if (postData.schedule_id) {
        pushLog(`Post scheduled successfully! Schedule ID: ${postData.schedule_id}`, 'success')
        if (postData.review_link) {
          setReviewLink(postData.review_link)
          pushLog(`Review link: ${postData.review_link}`, 'info')
          toast.success(`Post scheduled! Share review link with your team.`)
        } else {
          toast.success('Post scheduled successfully!')
        }
      } else {
        pushLog('AI post generated successfully! Please review and schedule or post.', 'success')
        if (includeImage && !imageUrl) {
          pushLog(data.image_error || 'Post text is ready, but the graphic failed. Use Regenerate Image.', 'warning')
        }
        toast.success('Post generated! Please review before posting or scheduling.')
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e.message || 'AI post generation failed'
      pushLog(`AI post generation failed: ${errorMsg}`, 'error')
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedText(generatedPost?.text || '')
  }

  const handleSaveEdit = () => {
    if (!generatedPost) return
    setGeneratedPost({
      ...generatedPost,
      text: editedText
    })
    setIsEditing(false)
    pushLog('Post content updated', 'success')
    toast.success('Post content updated')
  }

  const handleCancelEdit = () => {
    setEditedText(generatedPost?.text || '')
    setIsEditing(false)
  }

  const approveAndPost = async () => {
    if (!generatedPost) return
    
    setShowPostPayment(true)
  }

  const executePost = async () => {
    if (!generatedPost) return
    
    const textToPost = isEditing ? editedText : generatedPost.text
    
    setPosting(true)
    try {
      let imageUrl = generatedPost.imageUrl
      
      // If image is base64, upload to Supabase bucket first
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        // It's base64, upload to bucket
        pushLog('Uploading image to storage...', 'info')
        try {
          const uploadResponse = await api.post('/linkedin/upload-image', {
            image_base64: imageUrl
          })
          
          if (uploadResponse.data.error || !uploadResponse.data.image_url) {
            throw new Error(uploadResponse.data.error || 'Image upload failed')
          }
          
          imageUrl = uploadResponse.data.image_url
          pushLog('Image uploaded successfully!', 'success')
        } catch (uploadError: any) {
          const errorMsg = uploadError?.response?.data?.error || uploadError.message || 'Image upload failed'
          pushLog(`Image upload failed: ${errorMsg}`, 'error')
          toast.error(`Image upload failed: ${errorMsg}`)
          setPosting(false)
          return
        }
      }
      
      // Post to LinkedIn with image URL (if available)
      const payload: any = {
        text: textToPost,
      }
      
      if (imageUrl) {
        payload.imageUrl = imageUrl
      }
      
      await api.post('/linkedin/post', payload)
      pushLog('Post approved and published to LinkedIn!', 'success')
      toast.success('Post published to LinkedIn!')
      setGeneratedPost(null)
      setEditedText('')
      setIsEditing(false)
      setTopic('')
      setIncludeImage(false)
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || e?.response?.data?.message || e.message || 'Post failed'
      pushLog(`Post failed: ${errorMsg}`, 'error')
      toast.error(errorMsg)
    } finally {
      setPosting(false)
    }
  }

  const deleteGeneratedPost = () => {
    setGeneratedPost(null)
    setEditedText('')
    setIsEditing(false)
    pushLog('Generated post discarded', 'info')
    toast.info('Post discarded')
  }

  const regenerateContent = async () => {
    if (!connected) {
      pushLog('Please connect your LinkedIn account first', 'warning')
      toast.error('Please connect your LinkedIn account first')
      return
    }
    if (!generatedPost) return
    
    setLoading(true)
    try {
      const payload: any = { 
        topic: `${voiceKitPrefix(loadVoiceKit())}${generatedPost.topic}`, 
        includeImage: false, // Don't regenerate image, only content
        language: language || 'en',
        regenerate: true // Flag to indicate regeneration (no payment)
      }
      
      const { data } = await api.post('/linkedin/generate-ai-post', payload)
      
      // Extract content from various possible response formats
      let contentText = data.text || data.post || data.content || ''
      
      // If content is an object, try to extract text from it
      if (typeof contentText === 'object' && contentText !== null) {
        contentText = contentText.text || contentText.content || JSON.stringify(contentText)
      }
      
      // Ensure content is a string
      contentText = String(contentText || '').trim()
      
      const postData: GeneratedPost = {
        text: contentText,
        imageUrl: generatedPost.imageUrl, // Keep existing image
        topic: generatedPost.topic,
        schedule_id: generatedPost.schedule_id,
        review_link: generatedPost.review_link
      }
      setGeneratedPost(postData)
      setEditedText(postData.text)
      setIsEditing(false)
      
      if (!contentText) {
        pushLog('Warning: No content received during regeneration', 'warning')
        toast.error('Failed to regenerate content')
      } else {
        pushLog('Content regenerated successfully!', 'success')
        toast.success('Content regenerated!')
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e.message || 'Content regeneration failed'
      pushLog(`Content regeneration failed: ${errorMsg}`, 'error')
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const regenerateImage = async () => {
    if (!connected) {
      pushLog('Please connect your LinkedIn account first', 'warning')
      toast.error('Please connect your LinkedIn account first')
      return
    }
    if (!generatedPost) return
    
    setLoading(true)
    try {
      const payload: any = { 
        topic: generatedPost.topic, 
        includeImage: true, // Regenerate image
        language: language || 'en',
        regenerate: true // Flag to indicate regeneration (no payment)
      }
      
      const { data } = await api.post('/linkedin/generate-ai-post', payload)
      
      const imageUrl = data.imageUrl || data.image || data.image_url || null
      
      const postData: GeneratedPost = {
        text: generatedPost.text, // Keep existing content
        imageUrl: imageUrl || undefined,
        topic: generatedPost.topic,
        schedule_id: generatedPost.schedule_id,
        review_link: generatedPost.review_link
      }
      setGeneratedPost(postData)
      
      if (!imageUrl) {
        pushLog(data.image_error || 'Image generation returned no file', 'error')
        toast.error(data.image_error || 'Image did not generate. Try again.')
      } else {
        saveGalleryItem({ url: imageUrl, topic: generatedPost.topic })
        pushLog('Image regenerated successfully!', 'success')
        toast.success('Image regenerated!')
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e.message || 'Image regeneration failed'
      pushLog(`Image regeneration failed: ${errorMsg}`, 'error')
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const schedulePost = async () => {
    if (!generatedPost) return
    
    if (!showScheduleOptions) {
      toast.error('Please enable schedule options first')
      return
    }
    
    if (scheduleType === 'once' && (!scheduledDate || !scheduledTime)) {
      toast.error('Please select date and time for scheduling')
      return
    }
    
    if (scheduleType === 'recurring' && !cronExpression) {
      toast.error('Please enter cron expression for recurring schedule')
      return
    }
    
    setLoading(true)
    try {
      const postContent = isEditing ? editedText : generatedPost.text
      
      // Use scheduler endpoint with custom_text (the generated post content)
      const payload: any = {
        topic: generatedPost.topic,
        custom_text: postContent,  // Use the generated post content
        includeImage: !!generatedPost.imageUrl,
        require_approval: requireApproval
      }
      
      // Add image URL if available (for scheduling with image)
      if (generatedPost.imageUrl) {
        payload.imageUrl = generatedPost.imageUrl
      }
      
      if (scheduleType === 'once' && scheduledDate && scheduledTime) {
        // Combine date and time, convert to ISO string
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        payload.scheduled_at = scheduledDateTime
        // Don't include schedule for one-time posts
      } else if (scheduleType === 'recurring' && cronExpression) {
        payload.schedule = cronExpression
      }
      
      // Add team emails if approval required
      if (requireApproval) {
        const validEmails = teamEmails.filter(email => email.trim() !== '')
        if (validEmails.length > 0) {
          payload.team_emails = validEmails
        }
      }
      
      const { data } = await api.post('/linkedin/schedule', payload)
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      if (data.schedule_id) {
        const reviewLinkValue = data.review_link || reviewLink
        setGeneratedPost({
          ...generatedPost,
          schedule_id: data.schedule_id,
          review_link: reviewLinkValue || undefined
        })
        if (reviewLinkValue) {
          setReviewLink(reviewLinkValue)
        }
        pushLog(`Post scheduled successfully! Schedule ID: ${data.schedule_id}`, 'success')
        if (reviewLinkValue) {
          pushLog(`Review link: ${reviewLinkValue}`, 'info')
          toast.success(`Post scheduled! Share review link with your team.`)
        } else {
          toast.success('Post scheduled successfully!')
        }
      } else {
        toast.error('Failed to schedule post')
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || e?.response?.data?.message || e.message || 'Scheduling failed'
      pushLog(`Scheduling failed: ${errorMsg}`, 'error')
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden px-2 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="lab-glass border-border">
          <CardHeader className="p-4 sm:p-6 space-y-3">
            <PoweredByAsi />
            <CardTitle className="text-xl sm:text-3xl font-semibold tracking-tight">Studio</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              ASI:One writes the post and draws the graphic. Set a voice kit first for your tone.
            </CardDescription>
            <Link href="/voice" className="text-xs text-muted-foreground hover:underline">
              {hasVoiceKit(loadVoiceKit()) ? 'Voice kit on · edit' : 'Add a voice kit'}
            </Link>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-2">
          <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm sm:text-base">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                type="text"
                placeholder="e.g., AI trends in 2025, Latest tech innovations"
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Language</Label>
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-2 w-full">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    type="button"
                    variant={language === lang.code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage(lang.code)}
                    disabled={loading}
                    className="flex flex-col gap-1 h-auto py-2 min-w-0 text-xs sm:text-sm"
                  >
                    <span className="text-sm sm:text-base">{lang.flag}</span>
                    <span className="text-[10px] sm:text-xs truncate w-full">{lang.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeImage"
                checked={includeImage}
                onCheckedChange={(checked) => setIncludeImage(checked === true)}
              />
              <Label htmlFor="includeImage" className="text-xs sm:text-sm font-normal cursor-pointer break-words">
                Generate with AI image
              </Label>
            </div>
            
            {/* Schedule Options */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showSchedule"
                  checked={showScheduleOptions}
                  onCheckedChange={(checked) => setShowScheduleOptions(checked === true)}
                />
                <Label htmlFor="showSchedule" className="text-sm font-normal cursor-pointer">
                  Schedule this post
                </Label>
              </div>
              
              {showScheduleOptions && (
                <div className="space-y-3 pl-4 sm:pl-6 border-l-2 w-full overflow-x-hidden">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={scheduleType === 'once' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setScheduleType('once')}
                      className="flex-1 sm:flex-initial min-w-[100px]"
                    >
                      One-time
                    </Button>
                    <Button
                      type="button"
                      variant={scheduleType === 'recurring' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setScheduleType('recurring')}
                      className="flex-1 sm:flex-initial min-w-[100px]"
                    >
                      Recurring
                    </Button>
                  </div>
                  
                  {scheduleType === 'once' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      <div className="space-y-1 w-full min-w-0">
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-1 w-full min-w-0">
                        <Label className="text-xs">Time</Label>
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 w-full min-w-0">
                      <Label className="text-xs">Cron Expression</Label>
                      <Input
                        type="text"
                        value={cronExpression}
                        onChange={(e) => setCronExpression(e.target.value)}
                        placeholder="e.g., 0 9 * * * (9 AM daily)"
                        className="text-xs w-full"
                      />
                      <p className="text-xs text-muted-foreground break-words">
                        Format: minute hour day month weekday
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requireApproval"
                        checked={requireApproval}
                        onCheckedChange={(checked) => setRequireApproval(checked === true)}
                      />
                      <Label htmlFor="requireApproval" className="text-xs font-normal cursor-pointer">
                        Require team approval before posting
                      </Label>
                    </div>
                    
                    {requireApproval && (
                      <div className="pl-4 sm:pl-6 space-y-2 w-full min-w-0">
                        <Label className="text-xs">Team Member Emails (for approval)</Label>
                        {teamEmails.map((email, index) => (
                          <div key={index} className="flex gap-2 w-full min-w-0">
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                const newEmails = [...teamEmails]
                                newEmails[index] = e.target.value
                                setTeamEmails(newEmails)
                              }}
                              placeholder="team@example.com"
                              className="text-xs h-8 flex-1 min-w-0"
                            />
                            {teamEmails.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setTeamEmails(teamEmails.filter((_, i) => i !== index))
                                }}
                                className="h-8 px-2 flex-shrink-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTeamEmails([...teamEmails, ''])}
                          className="text-xs h-8 w-full sm:w-auto"
                        >
                          + Add Email
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Button onClick={generatePost} disabled={loading} className="w-full" size="default">
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? 'Generating...' : 'Generate Post'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generated Post Preview */}
      <AnimatePresence>
        {generatedPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex-1 min-w-0 max-w-full">
                    <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-start gap-2 break-words">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
                      <span className="break-words overflow-wrap-anywhere word-break-break-word">Generated Post Preview</span>
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm break-words overflow-wrap-anywhere word-break-break-word">
                      Review the generated post before publishing
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs sm:text-sm w-fit self-start break-words overflow-wrap-anywhere max-w-full hover:bg-primary/10">
                    <span className="break-words overflow-wrap-anywhere word-break-break-word">Topic: {generatedPost.topic}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                {/* Post Preview Section */}
                <div className="space-y-3 w-full min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label className="text-xs sm:text-sm font-medium">Post Preview</Label>
                    {!isEditing ? (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          onClick={regenerateContent}
                          variant="outline"
                          size="sm"
                          disabled={loading || posting}
                          className="flex-1 sm:flex-initial"
                        >
                          <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                          Regenerate
                        </Button>
                      <Button
                        onClick={handleEdit}
                        variant="outline"
                        size="sm"
                        disabled={posting}
                          className="flex-1 sm:flex-initial"
                      >
                        <Edit2 className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          onClick={handleSaveEdit}
                          variant="default"
                          size="sm"
                          className="flex-1 sm:flex-initial"
                        >
                          <Save className="mr-2 h-3 w-3" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-initial"
                        >
                          <X className="mr-2 h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Post Content Display */}
                  {isEditing ? (
                    <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="min-h-[200px] sm:min-h-[300px] font-mono text-xs sm:text-sm w-full max-w-full resize-y overflow-x-hidden break-words"
                      placeholder="Edit your post content..."
                    />
                  ) : (
                    <div className="min-h-[200px] sm:min-h-[300px] p-4 sm:p-6 rounded-lg border-2 border-primary/20 bg-card shadow-sm w-full max-w-full overflow-x-hidden">
                      {generatedPost.text && generatedPost.text.trim() ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere word-break-break-word text-sm sm:text-base md:text-lg leading-relaxed max-w-full text-foreground">
                          {generatedPost.text}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
                          <div className="text-center">
                            <p className="text-sm">No content generated yet</p>
                            <p className="text-xs mt-1">Click "Generate Post" to create content</p>
                      </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {generatedPost.imageUrl ? (
                    <div className="mt-4 rounded-lg overflow-hidden border w-full max-w-full">
                      <div className="relative w-full">
                        <img 
                          src={generatedPost.imageUrl} 
                          alt="Generated post image" 
                          className="w-full h-auto max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.alt = 'Image failed to load'
                          }}
                        />
                      </div>
                      <div className="p-2 bg-muted flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">AI Generated Image</span>
                        </div>
                        <Button
                          onClick={regenerateImage}
                          variant="outline"
                          size="sm"
                          disabled={loading || posting}
                          className="h-7 px-2 text-xs"
                        >
                          <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  ) : (
                    includeImage && (
                      <div className="mt-4 p-4 rounded-lg border border-dashed bg-muted/50 flex flex-col items-center justify-center w-full gap-2">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <span className="text-sm text-muted-foreground break-words">Image generation in progress or failed</span>
                        </div>
                        <Button
                          onClick={regenerateImage}
                          variant="outline"
                          size="sm"
                          disabled={loading || posting}
                        >
                          <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                          Regenerate Image
                        </Button>
                      </div>
                    )
                  )}
                </div>

                {/* Schedule Info */}
                {(generatedPost.schedule_id || reviewLink) && (
                  <div className="p-3 rounded-lg border bg-neutral-50 dark:bg-neutral-950/20 w-full min-w-0">
                    <div className="flex items-start justify-between gap-2 w-full min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 break-words">
                          Post Scheduled
                        </p>
                        {generatedPost.schedule_id && (
                          <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 break-all">
                            Schedule ID: {generatedPost.schedule_id}
                          </p>
                        )}
                        {(generatedPost.review_link || reviewLink) && (
                          <div className="mt-2 space-y-2 w-full min-w-0">
                            <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 break-words">
                              Review Link (Share with your team):
                            </p>
                            <div className="flex flex-col gap-2 w-full min-w-0">
                              <code className="text-[10px] sm:text-xs bg-white dark:bg-gray-800 px-2 py-1.5 rounded border break-all overflow-wrap-anywhere word-break-break-all min-w-0 block">
                                {generatedPost.review_link || reviewLink}
                              </code>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const link = generatedPost.review_link || reviewLink || ''
                                  navigator.clipboard.writeText(link)
                                  toast.success('Review link copied! Share it with your team.')
                                }}
                                className="w-full sm:w-auto self-start"
                              >
                                Copy Link
                              </Button>
                            </div>
                            {requireApproval && teamEmails.filter(e => e.trim()).length > 0 && (
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 break-words overflow-wrap-anywhere">
                                Team emails: {teamEmails.filter(e => e.trim()).join(', ')}
                              </p>
                            )}
                            
                            {/* Team Approval Status */}
                            {generatedPost.approval_status && (
                              <div className="mt-3 space-y-2">
                                {generatedPost.approval_status.approved ? (
                                  <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 break-words">
                                          ✅ Approved by {generatedPost.approval_status.approved_by}
                                        </p>
                                        {generatedPost.approval_status.approved_at && (
                                          <p className="text-[10px] text-neutral-700 dark:text-neutral-300 mt-0.5">
                                            {new Date(generatedPost.approval_status.approved_at).toLocaleString()}
                              </p>
                            )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                      <Bell className="h-4 w-4 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                                      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                                        ⏳ Waiting for team approval...
                                      </p>
                                    </div>
                          </div>
                        )}
                                
                                {/* Team Comments */}
                                {generatedPost.approval_status.comments && generatedPost.approval_status.comments.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Team Comments:</p>
                                    {generatedPost.approval_status.comments.map((comment, idx) => (
                                      <div key={idx} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start gap-2">
                                          <User className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-foreground break-words">
                                              {comment.email}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 break-words whitespace-pre-wrap">
                                              {comment.comment}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                              {new Date(comment.timestamp).toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2 w-full">
                  {!generatedPost.schedule_id && (
                    <>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                        <Button
                          onClick={approveAndPost}
                          disabled={posting || isEditing || showPostPayment}
                          className="flex-1 w-full"
                          size="default"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {posting ? 'Publishing...' : 'Approve & Post'}
                        </Button>
                        <Button
                          onClick={schedulePost}
                          disabled={loading || posting || isEditing || !showScheduleOptions}
                          variant="outline"
                          size="default"
                          className="flex-1 w-full"
                        >
                          Schedule Post
                        </Button>
                      </div>
                      <Button
                        onClick={deleteGeneratedPost}
                        disabled={posting || isEditing}
                        variant="destructive"
                        size="default"
                        className="w-full"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                  {generatedPost.schedule_id && (
                    <Button
                      onClick={deleteGeneratedPost}
                      disabled={posting || isEditing}
                      variant="destructive"
                      size="default"
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancel Schedule
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="border-2 border-primary/20">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notifications
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotifications([])}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2 max-h-64 overflow-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border ${
                      notif.type === 'success' 
                        ? 'bg-neutral-50 dark:bg-neutral-950/20 border-neutral-200 dark:border-neutral-800'
                        : notif.type === 'warning'
                        ? 'bg-neutral-50 dark:bg-neutral-950/20 border-neutral-200 dark:border-neutral-800'
                        : 'bg-neutral-50 dark:bg-neutral-950/20 border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {notif.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Bell className="h-4 w-4 text-neutral-600 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs break-words ${
                          notif.type === 'success'
                            ? 'text-neutral-900 dark:text-neutral-100'
                            : notif.type === 'warning'
                            ? 'text-neutral-900 dark:text-neutral-100'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(notif.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base font-semibold">Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono max-h-56 overflow-auto w-full">
              {!log.length ? (
                <div className="text-muted-foreground">No activity yet</div>
              ) : (
                log.map((e, i) => (
                  <div key={i} className={`break-words overflow-wrap-anywhere word-break-break-word ${e.type === 'error' ? 'text-destructive' : e.type === 'success' ? 'text-neutral-600 dark:text-neutral-400' : ''}`}>
                    [{e.ts}] {e.msg}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>


      {/* Payment Modal for Posting */}
      {showPostPayment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PaymentModal
            service="linkedin_post"
            serviceName="LinkedIn Post"
            onSuccess={async (txHash: string) => {
              setShowPostPayment(false)
              await executePost()
            }}
            onCancel={() => setShowPostPayment(false)}
            onServiceCall={executePost}
          />
        </motion.div>
      )}
    </div>
  )
}

