'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Youtube, Twitter, Calendar, Video, TrendingUp, Users, Clock, Zap, MessageSquare, Bot, Send, Smartphone } from 'lucide-react'

const upcomingPlatforms = [
  {
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-black dark:bg-gray-800',
    gradient: 'from-black/20 to-gray-800/20 dark:from-gray-800/20 dark:to-black/20',
    badgeColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    imagePosition: 'left', // Image on left, content on right
    features: [
      {
        icon: Video,
        title: 'Video Content Planning',
        description: 'Plan and schedule YouTube video uploads with AI-generated titles, descriptions, and tags.',
      },
      {
        icon: TrendingUp,
        title: 'SEO Optimization',
        description: 'Optimize your video metadata for better discoverability and higher rankings.',
      },
      {
        icon: Calendar,
        title: 'Smart Publishing',
        description: 'Schedule videos at optimal times when your audience is most active.',
      },
    ],
    image: 'https://images.unsplash.com/photo-1762340275232-6cb605dfd5a6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    comingSoon: true,
  },
  {
    name: 'X (Twitter)',
    icon: Twitter,
    color: 'bg-black dark:bg-gray-800',
    gradient: 'from-black/20 to-gray-800/20 dark:from-gray-800/20 dark:to-black/20',
    badgeColor: 'bg-gray-900/10 text-gray-900 dark:text-gray-100 border-gray-900/20 dark:border-gray-100/20',
    imagePosition: 'right', // Image on right, content on left
    features: [
      {
        icon: Zap,
        title: 'Thread Creation',
        description: 'Create engaging Twitter threads automatically with AI-powered content generation.',
      },
      {
        icon: Clock,
        title: 'Real-time Scheduling',
        description: 'Schedule tweets and threads to maximize engagement throughout the day.',
      },
      {
        icon: Users,
        title: 'Trend Analysis',
        description: 'Stay on top of trending topics and create content that resonates with your audience.',
      },
    ],
    image: 'https://images.unsplash.com/photo-1737619285988-e6f0f43a9981?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D0',
    comingSoon: true,
  },
]

export function UpcomingFeaturesSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-12 md:mb-16 px-2"
      >
        <Badge variant="outline" className="mb-3 sm:mb-4 text-xs sm:text-sm px-3 sm:px-4 py-1">
          Coming Soon
        </Badge>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">
          Expanding to More Platforms
        </h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
          We're bringing the same powerful AI content creation to YouTube and X (Twitter). 
          Stay ahead of the curve.
        </p>
      </motion.div>

      <div className="space-y-8 sm:space-y-12 md:space-y-16">
        {upcomingPlatforms.map((platform, platformIndex) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: platformIndex * 0.2 }}
          >
            <Card className="border-2 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Image Side - Alternating based on imagePosition */}
                <div className={`relative h-48 sm:h-64 md:h-80 lg:h-auto min-h-[300px] sm:min-h-[350px] md:min-h-[400px] ${
                  platform.imagePosition === 'left' 
                    ? 'order-2 lg:order-1' 
                    : 'order-2 lg:order-2'
                }`}>
                  <Image
                    src={platform.image}
                    alt={`${platform.name} Integration`}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-30`} />
                  
                  {/* Logo Overlay */}
                  <div className={`absolute top-4 z-10 ${
                    platform.imagePosition === 'left' ? 'right-4 lg:right-8' : 'left-4 lg:left-8'
                  }`}>
                    <div className={`${platform.color} rounded-xl p-3 shadow-2xl backdrop-blur-sm`}>
                      <platform.icon className="h-8 w-8 text-white dark:text-white" />
                    </div>
                  </div>

                  {platform.comingSoon && (
                    <div className={`absolute bottom-4 z-10 ${
                      platform.imagePosition === 'left' ? 'left-4 lg:left-8' : 'right-4 lg:right-8'
                    }`}>
                      <Badge className={`${platform.badgeColor} backdrop-blur-sm border-2 font-semibold px-3 py-1`}>
                        Coming Soon
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content Side - Alternating based on imagePosition */}
                <div className={`p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-center ${
                  platform.imagePosition === 'left'
                    ? 'order-1 lg:order-2 lg:pl-8 xl:pl-12'
                    : 'order-1 lg:order-1 lg:pr-8 xl:pr-12'
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className={`${platform.color} rounded-lg p-1.5 sm:p-2`}>
                      <platform.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">{platform.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Integration</p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6">
                    Bring the power of AI content creation to {platform.name}. 
                    Create, schedule, and optimize your content with ease.
                  </p>

                  <div className="space-y-3 sm:space-y-4">
                    {platform.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: platformIndex * 0.2 + featureIndex * 0.1 }}
                        className="flex gap-2 sm:gap-3 md:gap-4"
                      >
                        <div className={`${platform.color} rounded-lg p-1.5 sm:p-2 h-fit flex-shrink-0`}>
                          <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold mb-1 text-sm sm:text-base">{feature.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: platformIndex * 0.2 + 0.5 }}
                    className="mt-6 pt-6 border-t"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Expected launch: 1 March 2025</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Slack & WhatsApp Integration Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12 px-2"
        >
          <Badge variant="outline" className="mb-3 sm:mb-4 text-xs sm:text-sm px-3 sm:px-4 py-1">
            Upcoming Integration
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Connect InfluenOne on Slack & WhatsApp
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Talk directly to InfluenOne from your favorite communication platforms. 
            Create, schedule, and manage content without leaving your workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Slack Integration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 h-full hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-purple-500 rounded-xl p-2 sm:p-3 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" className="sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.855 19.725c0 1.391-1.164 2.52-2.6 2.52-1.436 0-2.6-1.129-2.6-2.52 0-1.392 1.164-2.521 2.6-2.521h2.6v2.521zm1.3 0c0-1.392 1.164-2.521 2.6-2.521 1.436 0 2.6 1.129 2.6 2.521v6.303c0 1.392-1.164 2.521-2.6 2.521-1.436 0-2.6-1.129-2.6-2.521v-6.303z" fill="white"/>
                      <path d="M12.245 6.855c-1.436 0-2.6-1.129-2.6-2.521 0-1.391 1.164-2.52 2.6-2.52 1.436 0 2.6 1.129 2.6 2.52v2.521h-2.6zm0 1.3c1.436 0 2.6 1.129 2.6 2.521 0 1.392-1.164 2.521-2.6 2.521H5.942c-1.436 0-2.6-1.129-2.6-2.521 0-1.392 1.164-2.521 2.6-2.521h6.303z" fill="white"/>
                      <path d="M25.145 12.245c0-1.436 1.129-2.6 2.521-2.6 1.391 0 2.52 1.164 2.52 2.6 0 1.436-1.129 2.6-2.52 2.6h-2.521v-2.6zm-1.3 0c0 1.436-1.129 2.6-2.521 2.6-1.391 0-2.52-1.164-2.52-2.6V5.942c0-1.436 1.129-2.6 2.52-2.6 1.392 0 2.521 1.164 2.521 2.6v6.303z" fill="white"/>
                      <path d="M19.755 25.145c1.436 0 2.6 1.129 2.6 2.52 0 1.392-1.164 2.521-2.6 2.521-1.436 0-2.6-1.129-2.6-2.521v-2.52h2.6zm0-1.3c-1.436 0-2.6-1.129-2.6-2.521 0-1.392 1.164-2.521 2.6-2.521h6.303c1.436 0 2.6 1.129 2.6 2.521 0 1.392-1.164 2.521-2.6 2.521h-6.303z" fill="white"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Slack Integration</h3>
                    <Badge className="mt-1 text-xs sm:text-sm bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Connect InfluenOne platform to your Slack workspace and interact directly with the AI assistant.
                  Create posts, check schedules, and get insights right from Slack channels.
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-purple-500/20 rounded-lg p-1.5 sm:p-2 mt-0.5 flex-shrink-0">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm mb-1">Direct AI Chat</h4>
                      <p className="text-xs text-muted-foreground">
                        Chat directly with InfluenOne AI from any Slack channel or DM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-purple-500/20 rounded-lg p-1.5 sm:p-2 mt-0.5 flex-shrink-0">
                      <Send className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm mb-1">Quick Actions</h4>
                      <p className="text-xs text-muted-foreground">
                        Create posts, schedule content, and manage your social media with simple commands
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-purple-500/20 rounded-lg p-1.5 sm:p-2 mt-0.5 flex-shrink-0">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm mb-1">Team Collaboration</h4>
                      <p className="text-xs text-muted-foreground">
                        Share drafts, approve content, and collaborate with your team seamlessly
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* WhatsApp Integration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 h-full hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-green-500 rounded-xl p-2 sm:p-3 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" className="sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.524.668 4.891 1.836 6.939L2 30l7.178-1.822C11.156 29.287 13.486 30 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.333c-2.089 0-4.044-.554-5.733-1.511l-.411-.243-4.244 1.078 1.089-4.089-.27-.429C6.133 20.844 5.333 18.511 5.333 16 5.333 10.11 10.11 5.333 16 5.333S26.667 10.11 26.667 16 21.89 26.667 16 27.333z" fill="white"/>
                      <path d="M21.733 18.711c-.355-.178-2.089-1.023-2.411-1.134-.322-.112-.556-.178-.789.178-.233.356-.911 1.134-1.112 1.378-.2.244-.4.267-.756.089-.356-.178-1.489-.533-2.844-1.689-1.044-.911-1.756-2.044-1.956-2.4-.2-.356-.022-.533.15-.711.155-.156.356-.4.533-.6.178-.2.244-.356.356-.6.111-.244.056-.444-.022-.622-.089-.178-.789-1.956-1.089-2.689-.289-.711-.6-.6-.789-.622-.2-.022-.444-.022-.689-.022-.244 0-.644.089-.989.444-.344.356-1.311 1.289-1.311 3.133 0 1.844 1.333 3.622 1.511 3.889.178.267 2.578 3.933 6.244 5.489.873.367 1.556.589 2.089.756.889.278 1.689.244 2.333.156.711-.1 2.089-.867 2.378-1.711.289-.844.289-1.556.2-1.711-.089-.156-.333-.244-.689-.422z" fill="white"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold">WhatsApp Integration</h3>
                    <Badge className="mt-1 text-xs sm:text-sm bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Connect InfluenOne platform to WhatsApp and manage your social media content on the go.
                  Send messages, create posts, and get instant responses from your mobile device.
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-green-500/20 rounded-lg p-1.5 sm:p-2 mt-0.5 flex-shrink-0">
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm mb-1">Voice & Text Commands</h4>
                      <p className="text-xs text-muted-foreground">
                        Create content using voice messages or simple text commands via WhatsApp
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-green-500/20 rounded-lg p-1.5 sm:p-2 mt-0.5 flex-shrink-0">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm mb-1">AI Assistant on Mobile</h4>
                      <p className="text-xs text-muted-foreground">
                        Get AI-powered content suggestions and assistance directly in your WhatsApp chat
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-green-500/20 rounded-lg p-1.5 sm:p-2 mt-0.5 flex-shrink-0">
                      <Send className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm mb-1">Instant Notifications</h4>
                      <p className="text-xs text-muted-foreground">
                        Receive updates about your scheduled posts and engagement metrics instantly
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="border-2 bg-muted/30">
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                Expected launch: 1 March 2025
              </p>
              <p className="text-xs text-muted-foreground">
                Connect your workspace and start managing your social media content effortlessly
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  )
}

