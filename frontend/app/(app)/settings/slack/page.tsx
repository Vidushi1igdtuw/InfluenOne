'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock } from 'lucide-react'

export default function SlackSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Slack Integration</h1>
        <p className="text-muted-foreground">
          Slack integration is coming soon!
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            We're working on bringing Slack integration to you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">
              Slack integration will allow you to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li>Create LinkedIn posts directly from Slack</li>
              <li>Generate AI-powered content using slash commands</li>
              <li>Convert URLs to LinkedIn posts</li>
              <li>Receive notifications for scheduled posts</li>
              <li>Get payment confirmations via Slack DM</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg bg-primary/5">
            <p className="text-sm font-medium mb-1">Stay tuned!</p>
            <p className="text-xs text-muted-foreground">
              We're working hard to bring you this feature. Check back soon for updates.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Planned Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Planned Features
          </CardTitle>
          <CardDescription>
            What to expect when Slack integration launches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="font-semibold mb-1">/create-post</div>
              <p className="text-sm text-muted-foreground">
                Create a LinkedIn post directly from Slack
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="font-semibold mb-1">/ai-generate</div>
              <p className="text-sm text-muted-foreground">
                Generate AI-powered LinkedIn post using LangChain
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="font-semibold mb-1">/url-to-post</div>
              <p className="text-sm text-muted-foreground">
                Convert URL content to LinkedIn post
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="font-semibold mb-1">/idea-generate</div>
              <p className="text-sm text-muted-foreground">
                Generate content ideas for LinkedIn posts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
