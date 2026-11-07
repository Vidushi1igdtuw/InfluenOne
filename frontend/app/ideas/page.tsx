'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Lightbulb, Sparkles, Copy, CheckCircle2 } from 'lucide-react'

export default function IdeasPage() {
  const [prompt, setPrompt] = useState('')
  const [industry, setIndustry] = useState('')
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [ideas, setIdeas] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const executeGenerate = async () => {
    if (!prompt.trim() && !industry.trim() && !topic.trim()) {
      toast.error('Please provide a prompt, industry, or topic')
      return
    }
    
    setLoading(true)
    setIdeas([])
    try {
      const { data } = await api.post('/linkedin/generate-ideas', {
        prompt: prompt.trim() || undefined,
        industry: industry.trim() || undefined,
        topic: topic.trim() || undefined,
        count,
        language: 'en'
      })

      if (data.error) {
        toast.error(data.error)
        return
      }

      setIdeas(data.ideas || [])
      if (data.ideas && data.ideas.length > 0) {
        toast.success(`Generated ${data.ideas.length} ideas!`)
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e.message || 'Failed to generate ideas')
    } finally {
      setLoading(false)
    }
  }

  const copyIdea = (idea: string, index: number) => {
    navigator.clipboard.writeText(idea)
    setCopiedIndex(index)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedIndex(null), 2000)
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
              <Sparkles className="h-6 w-6" />
              Generate Post Ideas
            </CardTitle>
            <CardDescription>
              No more time lost brainstorming content ideas. Generate LinkedIn post ideas for your business in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">What kind of LinkedIn post ideas do you need? *</Label>
              <Input
                id="prompt"
                placeholder="e.g., AI tools for content creators, Tech startup growth strategies, Personal branding tips for developers..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Describe what you want to post about - optimized for content creators, tech professionals, and LinkedIn
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry (Optional)</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Technology, Marketing, Finance"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic Focus (Optional)</Label>
                <Input
                  id="topic"
                  placeholder="e.g., AI trends, Leadership tips"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Number of Ideas</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                className="h-11"
              />
            </div>

            <Button onClick={executeGenerate} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Generate Ideas
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {ideas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Generated Ideas</CardTitle>
              <CardDescription>{ideas.length} ideas ready to use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence>
                  {ideas.map((idea, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border bg-card flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{idea}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyIdea(idea, index)}
                        className="shrink-0"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

    </div>
  )
}

