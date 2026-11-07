'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import api from '@/lib/api'
import { LandingHeader } from '@/components/landing/header'
import { LandingFooter } from '@/components/landing/footer'
import { CheckCircle2, XCircle, Loader2, Image as ImageIcon, Calendar, Clock } from 'lucide-react'

interface ReviewData {
  schedule_id?: string
  topic?: string
  content?: string
  image_url?: string
  scheduled_at?: string
  status?: string
  platform?: string
  team_emails?: string[]
  requires_email_verification?: boolean
  review_comments?: string
  error?: string
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string
  
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [comments, setComments] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [email, setEmail] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [requiresEmailVerification, setRequiresEmailVerification] = useState(false)
  const [teamEmails, setTeamEmails] = useState<string[]>([])

  useEffect(() => {
    if (token) {
      fetchReviewData()
    }
  }, [token])

  const verifyEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setVerifyingEmail(true)
    try {
      const { data } = await api.post(`/review/verify-email?token=${encodeURIComponent(token)}`, {
        email: email.trim(),
        token: token
      })
      
      if (data.verified) {
        const verifiedEmailValue = email.trim()
        setEmailVerified(true)
        setEmail(verifiedEmailValue) // Store verified email
        toast.success('Email verified! Loading review...')
        // Fetch review data after verification with email
        await fetchReviewData(verifiedEmailValue)
      } else {
        toast.error(data.error || 'Email verification failed')
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || e.message || 'Email verification failed'
      toast.error(errorMsg)
    } finally {
      setVerifyingEmail(false)
    }
  }

  const fetchReviewData = async (verifiedEmail?: string) => {
    try {
      setLoading(true)
      const url = verifiedEmail 
        ? `/review?token=${encodeURIComponent(token)}&email=${encodeURIComponent(verifiedEmail)}`
        : `/review?token=${encodeURIComponent(token)}`
      
      const { data } = await api.get(url)
      
      // Check if email verification is required (only if not already verified)
      if (data.requires_email_verification && !emailVerified && !verifiedEmail) {
        setRequiresEmailVerification(true)
        setTeamEmails(data.team_emails || [])
        setReviewData(null)
        return
      }
      
      // If we have schedule data (schedule_id or content), show it
      if (data.schedule_id || data.content) {
        setReviewData(data)
        setRequiresEmailVerification(false)
        if (verifiedEmail) {
          setEmailVerified(true) // Mark as verified if email was provided
        }
        if (data.error) {
          toast.warning(data.error)
        }
      } else if (data.error) {
        // Show error if present
        toast.error(data.error)
        setReviewData({ error: data.error })
      } else {
        // No data and no error - might be loading issue
        setReviewData({ error: "No review data available" })
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || e.message || 'Failed to load review data'
      toast.error(errorMsg)
      setReviewData({ error: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (actionType: 'approve' | 'reject') => {
    if (!token) {
      toast.error('Review token is missing')
      return
    }

    setSubmitting(true)
    setAction(actionType)
    
    try {
      // Include email in query params for approval tracking
      const emailParam = email ? `&email=${encodeURIComponent(email)}` : ''
      const { data } = await api.post(`/review?token=${encodeURIComponent(token)}${emailParam}`, {
        token: token,
        action: actionType,
        comments: comments.trim() || undefined
      })
      
      if (data.error) {
        toast.error(data.error)
      } else {
        if (data.payment_required && actionType === 'approve') {
          toast.success('Post approved. The creator publishes with a Stripe pack.')
        } else {
          toast.success(data.message || `${actionType === 'approve' ? 'Approved' : 'Rejected'} successfully!`)
        }
        setReviewData(prev => prev ? { ...prev, status: actionType === 'approve' ? 'pending' : 'rejected' } : null)
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || e?.response?.data?.message || e.message || 'Failed to submit review'
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
      setAction(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    } catch {
      return dateString
    }
  }

  // Email Verification Screen
  if (requiresEmailVerification && !emailVerified) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <LandingHeader />
        <div className="flex-1 flex items-center justify-center py-12 px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                Email Verification Required
              </CardTitle>
                <CardDescription className="text-primary-foreground/90 mt-2">
                Please verify your email to review this post
              </CardDescription>
            </CardHeader>
              <CardContent className="pt-6 space-y-5">
              {teamEmails.length > 0 && (
                  <div className="p-4 rounded-lg border-2 bg-muted/50">
                    <p className="text-sm font-semibold mb-2">Team Review Required</p>
                  <p className="text-xs text-muted-foreground">
                    This post requires approval from authorized team members. Please enter your email address to continue.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Your Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="team@example.com"
                  className="h-11"
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      verifyEmail()
                    }
                  }}
                  disabled={verifyingEmail}
                />
              </div>
              
              <Button
                onClick={verifyEmail}
                disabled={verifyingEmail || !email.trim()}
                  className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {verifyingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verify Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        </div>
        <LandingFooter />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <LandingHeader />
        <div className="flex-1 flex items-center justify-center py-12 px-4 pt-24">
          <Card className="w-full max-w-2xl border-2 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">Loading review...</p>
            </div>
          </CardContent>
        </Card>
        </div>
        <LandingFooter />
      </div>
    )
  }

  if (reviewData?.error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <LandingHeader />
        <div className="flex-1 flex items-center justify-center py-12 px-4 pt-24">
          <Card className="w-full max-w-2xl border-2 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-bold mb-2">Review Not Found</h2>
                <p className="text-muted-foreground text-center mb-6">{reviewData.error}</p>
                <Button onClick={() => router.push('/')} size="lg">Go to Home</Button>
            </div>
          </CardContent>
        </Card>
        </div>
        <LandingFooter />
      </div>
    )
  }

  if (!reviewData || (!reviewData.content && !reviewData.schedule_id && !reviewData.error)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <LandingHeader />
        <div className="flex-1 flex items-center justify-center py-12 px-4 pt-24">
          <Card className="w-full max-w-2xl border-2 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">Loading review data...</p>
            </div>
          </CardContent>
        </Card>
        </div>
        <LandingFooter />
      </div>
    )
  }

  const isProcessed = reviewData.status === 'pending' || reviewData.status === 'rejected' || reviewData.status === 'posted'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      <div className="flex-1 py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Calendar className="h-6 w-6" />
                      Post Review
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/90 mt-1">
                      Review and approve or reject this scheduled post
                    </CardDescription>
                  </div>
                  {isProcessed && (
                    <div className="px-4 py-1.5 bg-primary-foreground/20 rounded-full text-sm font-semibold backdrop-blur-sm">
                      {reviewData.status === 'pending' ? '✓ Approved' : reviewData.status === 'rejected' ? '✗ Rejected' : '✓ Posted'}
                    </div>
                  )}
                </div>
              </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              {/* Schedule Info */}
              <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg border-2 bg-muted/30">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Scheduled:</span>
                  <span className="text-muted-foreground">{formatDate(reviewData.scheduled_at)}</span>
                </div>
                {reviewData.platform && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Platform:</span>
                    <span className="capitalize text-muted-foreground">{reviewData.platform}</span>
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Post Content</Label>
                <div className="p-5 rounded-xl border-2 bg-muted/30 min-h-[200px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div 
                      className="text-sm leading-relaxed text-foreground"
                      dangerouslySetInnerHTML={{ 
                        __html: reviewData.content?.replace(/\n/g, '<br />')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>') || ''
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Image */}
              {reviewData.image_url && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Post Image</Label>
                  <div className="rounded-xl overflow-hidden border-2 bg-muted/30">
                    <div className="flex justify-center p-4">
                      <img 
                        src={reviewData.image_url} 
                        alt="Post image" 
                        className="max-w-full h-auto max-h-64 rounded-lg object-contain shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="p-3 bg-muted/50 border-t flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">Post Image</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {!isProcessed && (
                <div className="space-y-2">
                  <Label htmlFor="comments">Comments (Optional)</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments or feedback..."
                    className="min-h-[100px]"
                    disabled={submitting}
                  />
                </div>
              )}

              {/* Action Buttons */}
              {!isProcessed ? (
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    onClick={() => handleReview('approve')}
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                    size="lg"
                  >
                    {submitting && action === 'approve' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve & Schedule
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleReview('reject')}
                    disabled={submitting}
                    variant="destructive"
                    className="flex-1 shadow-lg"
                    size="lg"
                  >
                    {submitting && action === 'reject' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t">
                  <div className="p-5 rounded-xl border-2 bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground font-medium">
                      This post has already been {reviewData.status === 'pending' ? 'approved' : reviewData.status === 'rejected' ? 'rejected' : 'posted'}.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
      <LandingFooter />
    </div>
  )
}

