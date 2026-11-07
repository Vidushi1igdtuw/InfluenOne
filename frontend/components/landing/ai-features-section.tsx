'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Link2, FileText, Globe, Search, Lightbulb, Smile, Brain, MessageSquare } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
]

const postTypes = [
  { icon: Smile, label: 'Inspiring Post', emoji: '😍' },
  { icon: Brain, label: 'Instructive post', emoji: '🧠', selected: true },
  { icon: MessageSquare, label: 'Introspective post', emoji: '💬' },
]

export function AIFeaturesSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24">
      {/* Craft posts section */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-2xl bg-primary/5 blur-2xl opacity-50" />
          <Card className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base">My post</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 rounded-lg border bg-muted/50 min-h-[120px] sm:min-h-[150px]">
                <p className="text-xs sm:text-sm mb-2">Start with the basics 👇</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  The first step is to understand the editing format you're using.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Without that, it's impossible to have a professional rendering that's consistent with your editorial line 🎯
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Smile className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Emojis
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Link2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add media
                </Button>
                <Button size="sm" className="ml-auto text-xs sm:text-sm">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Craft posts that resonates with your audience
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6">
            Write standout posts with our AI LinkedIn Posts Generator powered by most advanced generative models and an internal algorithm trained for LinkedIn.
          </p>
          {/* <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
            <Image
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&q=80"
              alt="AI Writing"
              fill
              className="object-cover"
            />
          </div> */}
        </motion.div>
      </div>

      {/* Turn URLs into posts */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Turn URLs into LinkedIn posts
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Share the URLs of your favorite YouTube videos and blogs. InfluenOne will extract the content and repurpose it as a shiny LinkedIn post. One of the most appreciated features.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <Card className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-10 sm:w-16 sm:h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xs">04:35</span>
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm sm:text-base truncate">Naïlé Titah</div>
                <div className="text-xs sm:text-sm text-muted-foreground truncate">Head of Marketing</div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-sm sm:text-base">How do I edit a post?</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                LinkedIn has just added a new feature that lets you edit a post after it has been published.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Post types */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="space-y-2 sm:space-y-3">
            {postTypes.map((type, index) => (
              <Button
                key={index}
                variant={type.selected ? 'default' : 'outline'}
                className="w-full justify-start h-auto py-3 sm:py-4 text-sm sm:text-base"
              >
                <span className="text-lg sm:text-xl mr-2 sm:mr-3">{type.emoji}</span>
                <span>{type.label}</span>
              </Button>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Select post types for each use case
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Our AI allows you to craft LinkedIn posts of various types: actionable, inspiring, introspective, and promotional. This way, it covers all your needs.
          </p>
        </motion.div>
      </div>

      {/* Generate ideas */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Generate ideas in seconds
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            No more time lost brainstorming content ideas for LinkedIn. InfluenOne will bring LinkedIn post ideas for business to life in seconds.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Card className="p-4 sm:p-5 md:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input placeholder="Add a theme" className="pl-9 sm:pl-10 text-sm" defaultValue="SEO" />
              </div>
              <Button className="w-full text-sm sm:text-base">
                <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Idea generator
              </Button>
              <div className="space-y-2">
                <Card className="p-3 sm:p-4">
                  <p className="font-medium mb-1 text-xs sm:text-sm">5 essential tools for monitoring and analyzing your SEO performance.</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">Useful resources</Badge>
                    <Smile className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground ml-auto" />
                  </div>
                </Card>
                <Card className="p-3 sm:p-4">
                  <p className="font-medium mb-1 text-xs sm:text-sm">9 little-known SEO techniques to rank first on Google.</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">Explanation / analysis</Badge>
                    <Smile className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground ml-auto" />
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Languages */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-3">
            {languages.map((lang, index) => (
              <Button
                key={lang.code}
                variant={index === 0 ? 'default' : 'outline'}
                className="h-auto py-2 sm:py-3 flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <span className="text-xl sm:text-2xl">{lang.flag}</span>
                <span className="text-xs">{lang.name}</span>
              </Button>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Write in any language
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            InfluenOne supports content creation in 7 languages: English, French, Spanish, Italian, German, Portuguese, and Dutch.
          </p>
        </motion.div>
      </div>

      {/* Templates */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Import your favorite LinkedIn posts
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Do you have types of posts you publish regularly (e.g., job offers, new podcast episodes, etc.)? Is there a creator whose post structure you love? Simply use our templates feature to make your posts the most accurate!
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Card className="p-4 sm:p-5 md:p-6">
            <Button className="w-full mb-3 sm:mb-4 text-sm sm:text-base">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              My templates
            </Button>
            <div className="space-y-2 sm:space-y-3">
              <Card className="p-3 sm:p-4 bg-muted/50">
                <p className="text-xs sm:text-sm font-mono">
                  {'{Activity}'} has transformed my life:
                  <br />- {'{benefit 1}'}
                  <br />- {'{benefit 2}'}
                  <br />- {'{benefit 3}'}
                  <br />- {'{benefit 4}'}
                  <br />- {'{benefit 5}'}
                  <br />
                  <br />I began by {'{initial goal}'}.
                </p>
              </Card>
              <Card className="p-3 sm:p-4 border-dashed">
                <div className="flex flex-col items-center justify-center gap-2 py-3 sm:py-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">+</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium">New template</span>
                </div>
              </Card>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

