'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLinkedIn } from '@/contexts/LinkedInContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Send } from 'lucide-react'
import { PaymentModal } from '@/components/web3/PaymentModal'

export default function CreatePostPage() {
  const { connected } = useLinkedIn()
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [log, setLog] = useState<Array<{ msg: string; type: string; ts: string }>>([])

  const pushLog = (msg: string, type: string = 'info') => {
    setLog((l) => [...l, { msg, type, ts: new Date().toLocaleTimeString() }])
  }

  const executePost = async () => {
    setLoading(true)
    try {
      if (image) {
        // Convert image file to base64 and upload to Supabase bucket
        const reader = new FileReader()
        reader.onloadend = async () => {
          try {
            const base64String = reader.result as string
            
            // Step 1: Upload image to Supabase bucket
            pushLog('Uploading image to storage...', 'info')
            const uploadResponse = await api.post('/linkedin/upload-image', {
              image_base64: base64String
            })
            
            if (uploadResponse.data.error || !uploadResponse.data.image_url) {
              throw new Error(uploadResponse.data.error || 'Image upload failed')
            }
            
            const imageUrl = uploadResponse.data.image_url
            pushLog('Image uploaded successfully!', 'success')
            
            // Step 2: Post to LinkedIn with image URL
            await api.post('/linkedin/post', {
              text,
              imageUrl: imageUrl
            })
            
            pushLog('Posted to LinkedIn with image!', 'success')
            toast.success('Posted to LinkedIn with image!')
            setText('')
            setImage(null)
          } catch (e: any) {
            const errorMsg = e?.response?.data?.error || e?.response?.data?.message || e.message || 'Failed to upload or post'
            pushLog(`Error: ${errorMsg}`, 'error')
            toast.error(errorMsg)
            setLoading(false)
          }
        }
        reader.onerror = () => {
          pushLog('Failed to read image file', 'error')
          toast.error('Failed to read image file')
          setLoading(false)
        }
        reader.readAsDataURL(image)
        return // Exit early, onloadend will handle the post
      } else {
        // Post without image
        await api.post('/linkedin/post', { text })
        pushLog('Posted to LinkedIn!', 'success')
        toast.success('Posted to LinkedIn!')
        setText('')
        setImage(null)
        setLoading(false)
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || e?.response?.data?.message || e.message || 'Post failed'
      pushLog(`Error: ${errorMsg}`, 'error')
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  const post = async () => {
    if (!connected) {
      pushLog('Please connect your LinkedIn account first', 'warning')
      toast.error('Please connect your LinkedIn account first')
      return
    }
    if (!text.trim()) {
      pushLog('Please enter some text for your post', 'warning')
      toast.error('Please enter some text for your post')
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create a Post</CardTitle>
            <CardDescription>Share updates with or without images.</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-2">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-content">Post Content</Label>
              <Textarea
                id="post-content"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="What's on your mind?"
                className="min-h-[120px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Add Image (Optional)</Label>
              <input
                id="image"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                type="file"
                accept="image/*"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button onClick={post} disabled={loading || showPayment} className="w-full" size="lg">
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Posting...' : 'Post to LinkedIn'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {showPayment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PaymentModal
            service={image ? 'linkedin_post_with_image' : 'linkedin_post'}
            serviceName={image ? 'LinkedIn Post with Image' : 'LinkedIn Post'}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            onServiceCall={executePost}
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 text-sm font-mono max-h-56 overflow-auto">
              {!log.length ? (
                <div className="text-muted-foreground">No activity yet</div>
              ) : (
                log.map((e, i) => (
                  <div key={i} className={e.type === 'error' ? 'text-destructive' : e.type === 'success' ? 'text-neutral-600 dark:text-neutral-400' : ''}>
                    [{e.ts}] {e.msg}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

