'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLinkedIn } from '@/contexts/LinkedInContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Link, Send, Image as ImageIcon, Copy, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react'
import { PaymentModal } from '@/components/web3/PaymentModal'

export default function URLToPostPage() {
  const { connected } = useLinkedIn()
  const [url, setUrl] = useState('')
  const [includeImage, setIncludeImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [result, setResult] = useState<{
    text: string
    hashtags: string[]
    imageUrl?: string
    source_url: string
    source_title?: string
    linkedin_post_url?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  const requestConvert = async () => {
    if (!connected) {
      toast.error('Please connect your LinkedIn account first')
      return
    }
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setShowPayment(true)
  }

  // The service itself is run by PaymentModal via onServiceCall — onSuccess
  // only closes the modal so the action never executes twice.
  const handlePaymentSuccess = async (_txHash: string) => {
    setShowPayment(false)
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  const executeConvert = async () => {
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/linkedin/url-to-post', {
        url,
        includeImage,
        language: 'en'
      })

      if (data.error) {
        if (data.error.includes('Payment required') || data.error.includes('payment')) {
          toast.error(data.error)
          setShowPayment(true)
          return
        }
        toast.error(data.error)
        return
      }

      const imageUrl = data.imageUrl || data.image || data.image_url || null

      setResult({
        text: data.text || '',
        hashtags: data.hashtags || [],
        imageUrl: imageUrl,
        source_url: data.source_url || url,
        source_title: data.source_title,
        linkedin_post_url: data.linkedin_post_url
      })
      
        toast.success('Post generated successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e.message || 'Failed to convert URL to post')
    } finally {
      setLoading(false)
    }
  }

  const post = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!result) {
      toast.error('No post content available')
      return
    }
    
    if (posting) {
      return
    }
    
    // Post directly to LinkedIn without payment (payment already done during conversion)
    await executePost()
  }

  const executePost = async () => {
    if (!result) return
    setPosting(true)
    try {
      const { data } = await api.post('/linkedin/post', {
        text: result.text + (result.hashtags.length > 0 ? '\n\n' + result.hashtags.join(' ') : ''),
        imageUrl: result.imageUrl
      })
      
      if (data.linkedin_post_url) {
        // Update result with LinkedIn post URL
        setResult({
          ...result,
          linkedin_post_url: data.linkedin_post_url
        })
        toast.success('Posted to LinkedIn!', {
          action: {
            label: 'View Post',
            onClick: () => window.open(data.linkedin_post_url, '_blank')
          }
        })
      } else {
        toast.success('Posted to LinkedIn!')
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e.message || 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  const copyText = () => {
    if (!result) return
    const fullText = result.text + (result.hashtags.length > 0 ? '\n\n' + result.hashtags.join(' ') : '')
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const regenerateContent = async () => {
    if (!connected) {
      toast.error('Please connect your LinkedIn account first')
      return
    }
    if (!result || !url.trim()) return
    
    setLoading(true)
    try {
      const { data } = await api.post('/linkedin/url-to-post', {
        url,
        includeImage: false, // Don't regenerate image, only content
        language: 'en',
        regenerate: true // Flag to indicate regeneration (no payment)
      })

      if (data.error) {
        toast.error(data.error)
        return
      }

      setResult({
        text: data.text || '',
        hashtags: data.hashtags || [],
        imageUrl: result.imageUrl, // Keep existing image
        source_url: data.source_url || url,
        source_title: data.source_title,
        linkedin_post_url: result.linkedin_post_url // Keep existing LinkedIn post URL if any
      })
      
      toast.success('Content regenerated successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e.message || 'Failed to regenerate content')
    } finally {
      setLoading(false)
    }
  }

  const regenerateImage = async () => {
    if (!connected) {
      toast.error('Please connect your LinkedIn account first')
      return
    }
    if (!result || !url.trim()) return
    
    setLoading(true)
    try {
      const { data } = await api.post('/linkedin/url-to-post', {
        url,
        includeImage: true, // Regenerate image
        language: 'en',
        regenerate: true // Flag to indicate regeneration (no payment)
      })

      if (data.error) {
        toast.error(data.error)
        return
      }

      const imageUrl = data.imageUrl || data.image || data.image_url || null

      setResult({
        text: result.text, // Keep existing content
        hashtags: result.hashtags, // Keep existing hashtags
        imageUrl: imageUrl,
        source_url: result.source_url,
        source_title: result.source_title,
        linkedin_post_url: result.linkedin_post_url // Keep existing LinkedIn post URL if any
      })
      
      toast.success('Image regenerated successfully!')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e.message || 'Failed to regenerate image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Link className="h-6 w-6" />
              Turn URLs into LinkedIn Posts
            </CardTitle>
            <CardDescription>
              Share URLs of your favorite YouTube videos and blogs. We'll extract the content and repurpose it as a LinkedIn post.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/article or https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-image"
                  checked={includeImage}
                  onCheckedChange={(checked) => setIncludeImage(checked === true)}
                />
                <Label htmlFor="include-image" className="text-sm font-normal cursor-pointer">
                  Include AI-generated image
                </Label>
              </div>
            </div>

            <Button onClick={requestConvert} disabled={loading || !url.trim()} className="w-full" size="lg">
              {loading ? 'Converting...' : 'Convert to LinkedIn Post'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Generated Post</CardTitle>
              {result.source_title && (
                <CardDescription>
                  Source: <a href={result.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {result.source_title}
                  </a>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {result.imageUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={result.imageUrl}
                    alt="Generated post image"
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Load+Error'
                    }}
                  />
                  <div className="p-2 bg-muted flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
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
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm font-medium">Post Content</Label>
                  <Button
                    onClick={regenerateContent}
                    variant="outline"
                    size="sm"
                    disabled={loading || posting}
                  >
                    <RefreshCw className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                </div>
                <Textarea
                  value={result.text}
                  readOnly
                  className="min-h-[200px]"
                />
                {result.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-sm text-primary font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {result.linkedin_post_url ? (
                <div className="space-y-2">
                  <div className="p-3 bg-neutral-900/10 border border-neutral-500/20 rounded-lg">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mb-2">
                      ✅ Posted to LinkedIn!
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <a
                        href={result.linkedin_post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on LinkedIn
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={copyText} variant="outline" className="flex-1">
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={post} 
                    disabled={posting} 
                    className="flex-1 relative z-10"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {posting ? 'Posting...' : 'Post to LinkedIn'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Payment Modal - Shown only for URL conversion */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={handlePaymentCancel} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
            className="relative z-50 w-full max-w-md"
        >
          <PaymentModal
              service="url_to_post"
              serviceName="URL to Post"
              onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
              onServiceCall={executeConvert}
          />
        </motion.div>
        </div>
      )}
    </div>
  )
}

