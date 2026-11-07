'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import api from '@/lib/api'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Users, Zap, Calendar, Loader2 } from 'lucide-react'

interface AnalyticsData {
  total_posts: number
  total_spent: number
  total_earned: number
  engagement_rate: number
  avg_engagement: number
  posts_by_service: Array<{ service: string; count: number; spent: number }>
  recent_payments: Array<{
    id: string
    service: string
    amount: string
    status: string
    created_at: string
    tx_hash?: string
  }>
  engagement_trends: Array<{ date: string; engagement: number; posts: number }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/analytics?range=${timeRange}`)
      if (data.error) {
        toast.error(data.error)
      } else {
        setAnalytics(data)
      }
    } catch (error: any) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No analytics data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Analytics & Insights
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Track your performance and Stripe pack usage
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {(['7d', '30d', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-2xl font-bold">{analytics.total_posts}</div>
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-2">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">FET/Stripe Spent</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-2xl font-bold">{analytics.total_spent.toFixed(2)}</div>
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total payments</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-2">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">FET/Stripe Earned</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{analytics.total_earned.toFixed(2)}</div>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">From tips & commissions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-2">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-2xl font-bold">{analytics.engagement_rate.toFixed(1)}%</div>
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Avg: {analytics.avg_engagement}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Spending by Service */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              Spending by Service
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">FET/Stripe usage breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {analytics.posts_by_service.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base capitalize truncate">{item.service.replace(/_/g, ' ')}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{item.count} uses</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-bold text-sm sm:text-base">{item.spent.toFixed(2)} FET/Stripe</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      {(item.spent / analytics.total_spent * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="border-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Recent Payments
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your FET/Stripe transaction history</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {analytics.recent_payments.map((payment) => (
                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base capitalize break-words">{payment.service.replace(/_/g, ' ')}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(payment.created_at).toLocaleString()}
                    </div>
                    {payment.tx_hash && (
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-mono mt-1 break-all">
                        {payment.tx_hash.slice(0, 10)}...{payment.tx_hash.slice(-8)}
                      </div>
                    )}
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="font-bold text-sm sm:text-base">{payment.amount} FET/Stripe</div>
                    <Badge
                      variant={payment.status === 'verified' ? 'default' : 'secondary'}
                      className="mt-1 text-[10px] sm:text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

