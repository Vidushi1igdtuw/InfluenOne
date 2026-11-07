'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import api from '@/lib/api'
import { ExternalLink, Calendar, Link as LinkIcon, Loader2, Copy, CheckCircle2, RefreshCw, Heart } from 'lucide-react'
import { PaymentModal } from '@/components/web3/PaymentModal'
import { Label } from '@/components/ui/label'

interface Post {
  id: string
  topic: string
  content: string
  hashtags: string[]
  image_url?: string
  source_url?: string
  linkedin_post_url?: string
  linkedin_post_id?: string
  language: string
  created_at: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [tippingPost, setTippingPost] = useState<string | null>(null)
  const [showTipPayment, setShowTipPayment] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/linkedin/posts')
      if (data.error) {
        setError(data.error)
      } else {
        setPosts(data.posts || [])
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to fetch posts')
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  // Extract URN from LinkedIn URL for iframe embedding
  const getLinkedInEmbedUrn = (url: string): string | null => {
    try {
      // Format 1: URL contains URN directly (e.g., https://www.linkedin.com/feed/update/urn:li:share:7416155517565337600/)
      const urnMatch = url.match(/urn:li:(share|activity):(\d+)/)
      if (urnMatch) {
        return `urn:li:${urnMatch[1]}:${urnMatch[2]}`
      }
      
      // Format 2: Activity format (e.g., https://www.linkedin.com/posts/username_activity-1234567890-...)
      const activityMatch = url.match(/activity-(\d+)/)
      if (activityMatch) {
        return `urn:li:activity:${activityMatch[1]}`
      }
      
      // Format 3: Feed update with numeric ID - convert to activity URN
      // e.g., https://www.linkedin.com/feed/update/7416898089464057856 -> urn:li:activity:7416898092521668608
      const feedUpdateMatch = url.match(/\/feed\/update\/(\d+)/)
      if (feedUpdateMatch) {
        const numericId = feedUpdateMatch[1]
        // Try to get the correct activity ID from backend or use the numeric ID as activity
        // For now, we'll try to fetch the correct format from the post data
        return `urn:li:activity:${numericId}`
      }
      
      // Format 4: Posts format - try to extract post ID
      const postMatch = url.match(/\/posts\/[^/]+\/([^/?]+)/)
      if (postMatch) {
        const postId = postMatch[1]
        // If it looks like a numeric ID, use it
        if (/^\d+$/.test(postId)) {
          return `urn:li:share:${postId}`
        }
      }
      
      return null
    } catch (e) {
      return null
    }
  }

  // Normalize LinkedIn URL to proper format
  const normalizeLinkedInUrl = (url: string, postId?: string): string => {
    try {
      if (!url) return url
      
      // If URL is just a numeric ID, convert to proper format
      if (/^\d+$/.test(url)) {
        return `https://www.linkedin.com/feed/update/urn:li:activity:${url}/`
      }
      
      // If URL contains numeric ID without URN format, convert it
      // e.g., https://www.linkedin.com/feed/update/7416898089464057856
      const feedUpdateNumericMatch = url.match(/\/feed\/update\/(\d+)(?:\/|$)/)
      if (feedUpdateNumericMatch && !url.includes('urn:li:')) {
        const numericId = feedUpdateNumericMatch[1]
        return `https://www.linkedin.com/feed/update/urn:li:activity:${numericId}/`
      }
      
      // If URL doesn't have urn:li:activity format but has numeric ID, convert it
      const numericMatch = url.match(/\/(\d+)(?:\/|$)/)
      if (numericMatch && !url.includes('urn:li:')) {
        const numericId = numericMatch[1]
        // Check if it's a feed update URL
        if (url.includes('/feed/update/')) {
          return `https://www.linkedin.com/feed/update/urn:li:activity:${numericId}/`
        }
      }
      
      // If URL already has proper format, return as is
      if (url.includes('urn:li:activity:') || url.includes('urn:li:share:')) {
        return url
      }
      
      // If we have postId and URL doesn't look right, try to use postId
      if (postId && !url.includes('urn:li:') && !url.includes('linkedin.com')) {
        return `https://www.linkedin.com/feed/update/urn:li:activity:${postId}/`
      }
      
      return url
    } catch (e) {
      return url
    }
  }

  const copyLinkedInUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      toast.success('LinkedIn URL copied to clipboard!')
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (e) {
      toast.error('Failed to copy URL')
    }
  }

  const tipPost = async (postId: string) => {
    setTippingPost(postId)
    setShowTipPayment(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm sm:text-base">Loading your posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <Card className="border-destructive border-2 w-full max-w-md shadow-lg">
          <CardContent className="pt-6 p-4 sm:p-6">
            <p className="text-destructive text-sm sm:text-base mb-4 break-words">{error}</p>
            <Button onClick={fetchPosts} className="w-full sm:w-auto" variant="outline" size="lg">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <div className="space-y-0.5 flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  My Posts
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View all posts generated from this platform with their LinkedIn links
                </CardDescription>
              </div>
              <Button 
                onClick={fetchPosts} 
                variant="outline" 
                size="sm" 
                disabled={loading} 
                className="shadow-sm w-full sm:w-auto h-8 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 shadow-lg">
            <CardContent className="pt-8 pb-8 text-center p-4">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <LinkIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-semibold text-base">No posts found</p>
                  <p className="text-muted-foreground text-xs mt-1">Start creating posts to see them here!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {posts.map((post, index) => {
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="border-2 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                  <CardHeader className="pb-2 p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <CardTitle className="text-base sm:text-lg font-bold">{post.topic}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-xs">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="break-words">{formatDate(post.created_at)}</span>
                        </CardDescription>
                      </div>
                      <div className="flex-shrink-0">
                        {post.linkedin_post_url ? (
                          <Badge variant="outline" className="bg-neutral-900/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/30 px-2 py-1 text-xs font-semibold w-full sm:w-auto justify-center">
                            ✓ Posted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground px-2 py-1 text-xs w-full sm:w-auto justify-center">
                            Not Posted
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 p-3 sm:p-4">
                    {/* LinkedIn Post - Only if URL exists */}
                    {post.linkedin_post_url ? (
                      <div className="space-y-3">
                        {/* LinkedIn Post URL */}
                        <div className="p-2.5 sm:p-3 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
                              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>LinkedIn Post URL</span>
                            </Label>
                            <div className="flex gap-1.5">
                              <Button
                                onClick={() => tipPost(post.id)}
                                variant="outline"
                                size="sm"
                                className="h-8 shadow-sm flex-1 sm:flex-initial px-2"
                                disabled={tippingPost === post.id}
                              >
                                <Heart className="h-3.5 w-3.5 mr-1 text-neutral-500" />
                                <span className="sm:hidden text-xs">Tip</span>
                                <span className="hidden sm:inline text-xs">Tip</span>
                              </Button>
                              <Button
                                onClick={() => {
                                  const normalizedUrl = normalizeLinkedInUrl(post.linkedin_post_url || '', post.linkedin_post_id)
                                  copyLinkedInUrl(normalizedUrl)
                                }}
                                variant="outline"
                                size="sm"
                                className="h-8 shadow-sm flex-1 sm:flex-initial px-2"
                              >
                                {copiedUrl === post.linkedin_post_url ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-neutral-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                                <span className="ml-1.5 sm:hidden text-xs">Copy</span>
                              </Button>
                              <Button
                                asChild
                                size="sm"
                                className="h-8 bg-primary hover:bg-primary/90 shadow-sm flex-1 sm:flex-initial px-2 text-xs"
                              >
                                <a
                                  href={normalizeLinkedInUrl(post.linkedin_post_url || '', post.linkedin_post_id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  Open
                                </a>
                              </Button>
                            </div>
                          </div>
                          <div className="p-2 bg-background/80 rounded-md border font-mono text-[10px] break-all backdrop-blur-sm">
                            {normalizeLinkedInUrl(post.linkedin_post_url || '', post.linkedin_post_id)}
                          </div>
                        </div>

                        {/* LinkedIn Post Embed */}
                        {(() => {
                          const normalizedUrl = normalizeLinkedInUrl(post.linkedin_post_url || '', post.linkedin_post_id)
                          const embedUrn = getLinkedInEmbedUrn(normalizedUrl)
                          if (embedUrn) {
                            return (
                              <div className="rounded-lg border-2 bg-muted/30 overflow-hidden w-full">
                                <iframe
                                  src={`https://www.linkedin.com/embed/feed/update/${embedUrn}`}
                                  height="600"
                                  width="100%"
                                  frameBorder="0"
                                  allowFullScreen
                                  title={`LinkedIn Post - ${post.topic}`}
                                  className="w-full border-0"
                                  style={{ minHeight: '600px' }}
                                />
                              </div>
                            )
                          } else {
                            // Fallback: Show link if URN cannot be extracted
                            return (
                              <div className="rounded-lg border-2 bg-muted/30 p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-3">
                                  Unable to embed this post. Please click the link below to view it.
                                </p>
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                >
                                  <a
                                    href={normalizeLinkedInUrl(post.linkedin_post_url || '', post.linkedin_post_id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View on LinkedIn
                                  </a>
                                </Button>
                              </div>
                            )
                          }
                        })()}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg border-2 border-dashed bg-muted/30 text-center">
                        <p className="text-xs text-muted-foreground font-medium">This post has not been posted to LinkedIn yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {showTipPayment && tippingPost && (
        <PaymentModal
          service="linkedin_post"
          serviceName="Tip"
          onSuccess={async () => {
            toast.success('Tip sent with Stripe')
            setShowTipPayment(false)
            setTippingPost(null)
          }}
          onCancel={() => {
            setShowTipPayment(false)
            setTippingPost(null)
          }}
          onServiceCall={async () => {
            if (!tippingPost) return {}
            await api.post('/api/posts/tip', { post_id: tippingPost, amount: 1 })
            return {}
          }}
        />
      )}
    </div>
  )
}

