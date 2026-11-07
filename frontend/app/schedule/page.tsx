'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLinkedIn } from '@/contexts/LinkedInContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { toast } from 'sonner'
import api from '@/lib/api'
import { formatIST } from '@/lib/utils'
import { Calendar as CalendarIcon, Plus, Play, Pause, Trash2, Clock, AlertTriangle, Image as ImageIcon, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { PaymentModal } from '@/components/web3/PaymentModal'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Schedule {
  _id: string
  topic: string
  schedule: string
  nextPostAt: string
  postCount: number
  isActive: boolean
  includeImage: boolean
  content?: string
  imageUrl?: string
  lastPostContent?: string
  lastPostImageUrl?: string
}

export default function SchedulePage() {
  const { connected } = useLinkedIn()
  const [topic, setTopic] = useState('')
  const [includeImage, setIncludeImage] = useState(false)
  const [time, setTime] = useState('09:00')
  const [timezone, setTimezone] = useState<'IST' | 'UTC'>('IST')
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends' | 'weekly'>('daily')
  const [days, setDays] = useState<string[]>(['Mon'])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showPayment, setShowPayment] = useState(false)
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const toggleDay = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const buildCron = () => {
    const [h, m] = time.split(':').map(Number)
    
    let utcH = h
    let utcM = m
    
    // Convert to UTC if timezone is IST
    if (timezone === 'IST') {
      // IST is UTC+5:30, so we subtract 5 hours 30 minutes
      utcH = h - 5  // Subtract 5 hours
      utcM = m - 30 // Subtract 30 minutes
      
      // Handle minute overflow
      if (utcM < 0) {
        utcM += 60
        utcH -= 1
      }
      
      // Handle hour overflow (could be negative, meaning previous day)
      if (utcH < 0) {
        utcH += 24
      }
    }
    // If UTC, use time as-is
    
    let exp = `${utcM} ${utcH}`
    if (frequency === 'daily') exp += ' * * *'
    else if (frequency === 'weekdays') exp += ' * * 1-5'
    else if (frequency === 'weekends') exp += ' * * 0,6'
    else if (frequency === 'weekly')
      exp += ` * * ${days.map((d) => DAYS.indexOf(d)).join(',')}`
    else exp += ' * * *'
    return exp
  }

  const requestSchedule = async () => {
    if (!connected) {
      toast.error('Please connect your LinkedIn account first')
      return
    }
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }
    setShowPayment(true)
  }


  const loadSchedules = async () => {
    try {
      const { data } = await api.get('/linkedin/schedules')
      
      if (data.error) {
        toast.error(data.error)
        setSchedules([])
        return
      }
      
      // Backend returns GetSchedulesRESTResponse with schedules array
      if (data && Array.isArray(data.schedules)) {
        setSchedules(data.schedules)
      } else if (Array.isArray(data)) {
        setSchedules(data)
      } else {
        setSchedules([])
      }
    } catch (e: any) {
      toast.error('Error loading schedules')
      setSchedules([])
    }
  }

  const toggleScheduleState = async (id: string, activate: boolean) => {
    try {
      await api.post('/linkedin/schedules/action', {
        schedule_id: id,
        action: activate ? 'activate' : 'deactivate'
      })
      toast.success(`Schedule ${activate ? 'activated' : 'deactivated'}!`)
      await loadSchedules()
    } catch (e: any) {
      toast.error('Failed to update schedule')
    }
  }

  const deleteSchedule = async (id: string) => {
    setDeleteScheduleId(id)
  }

  const confirmDelete = async () => {
    if (!deleteScheduleId) return
    
    setDeleting(true)
    try {
      await api.post('/linkedin/schedules/action', {
        schedule_id: deleteScheduleId,
        action: 'delete'
      })
      toast.success('Schedule deleted!')
      await loadSchedules()
      setDeleteScheduleId(null)
    } catch (e: any) {
      toast.error('Error deleting schedule')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteScheduleId(null)
  }

  useEffect(() => {
    loadSchedules()
  }, [])

  // Get scheduled dates for the current month from backend
  const [scheduledDates, setScheduledDates] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    const fetchScheduledDates = async () => {
      if (!selectedDate) {
        setScheduledDates(new Set())
        return
      }
      
      try {
        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth() + 1 // JavaScript months are 0-indexed, backend expects 1-indexed
        const { data } = await api.get(`/linkedin/schedules/dates?year=${year}&month=${month}`)
        
        if (data.error) {
          setScheduledDates(new Set())
          return
        }
        
        setScheduledDates(new Set(data.dates || []))
      } catch (e: any) {
        setScheduledDates(new Set())
      }
    }
    
    fetchScheduledDates()
  }, [schedules, selectedDate])

  // Convert scheduled date strings to Date objects for calendar modifiers
  const scheduledDateObjects = useMemo(() => {
    return Array.from(scheduledDates).map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    })
  }, [scheduledDates])

  // Get posts for selected date from backend
  const [postsForSelectedDate, setPostsForSelectedDate] = useState<Array<{ schedule: Schedule; date: Date }>>([])
  
  useEffect(() => {
    const fetchPostsForDate = async () => {
      if (!selectedDate) {
        setPostsForSelectedDate([])
        return
      }
      
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const { data } = await api.get(`/linkedin/schedules/occurrences?date=${dateStr}`)
        
        if (data.error) {
          setPostsForSelectedDate([])
          return
        }
        
        const posts: Array<{ schedule: Schedule; date: Date }> = (data.occurrences || []).map((occ: any) => {
          // Transform backend schedule format to frontend format
          const schedule: Schedule = {
            _id: occ.schedule.id,
            topic: occ.schedule.content || occ.schedule.topic || '',
            schedule: occ.schedule.cron_expression || '',
            nextPostAt: occ.schedule.scheduled_at || '',
            postCount: 0,
            isActive: occ.schedule.status in ['pending', 'scheduled'],
            includeImage: !!occ.schedule.image_url,
          }
          
          return {
            schedule,
            date: new Date(occ.date)
          }
        })
        
        // Sort by date
        posts.sort((a, b) => a.date.getTime() - b.date.getTime())
        setPostsForSelectedDate(posts)
      } catch (e: any) {
        setPostsForSelectedDate([])
      }
    }
    
    fetchPostsForDate()
  }, [schedules, selectedDate])

  const readable = () => {
    const [h, m] = time.split(':')
    const t = new Date()
    t.setHours(+h, +m)
    const ampm = t.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    switch (frequency) {
      case 'daily':
        return `Every day at ${ampm} ${timezone}`
      case 'weekdays':
        return `Every weekday (Mon–Fri) at ${ampm} ${timezone}`
      case 'weekends':
        return `Every weekend (Sat–Sun) at ${ampm} ${timezone}`
      case 'weekly':
        return `Every ${days.join(', ')} at ${ampm} ${timezone}`
      default:
        return `At ${ampm} ${timezone}`
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 bg-gradient-to-br from-neutral-900/5 via-background to-background">
          <CardHeader className="p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-900 flex items-center justify-center shadow-lg">
                <CalendarIcon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-900 bg-clip-text text-transparent">
                  Content Scheduler
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Create recurring scheduled posts for your LinkedIn account. Set it once and let AI handle the rest.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Calendar View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Calendar View
            </CardTitle>
            <CardDescription>
              View and manage your scheduled posts on the calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex justify-center lg:justify-start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    scheduled: scheduledDateObjects
                  }}
                  modifiersClassNames={{
                    scheduled: 'bg-primary/20 text-primary font-semibold border-primary/30'
                  }}
                />
              </div>
              <div className="flex-1">
                {selectedDate && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                      Posts scheduled for {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
                    {postsForSelectedDate.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No posts scheduled for this date.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {postsForSelectedDate.map((item, idx) => (
                          <motion.div
                            key={`${item.schedule._id}-${idx}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 rounded-lg border bg-card"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{item.schedule.topic}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Scheduled at {formatIST(item.date)} IST
                                </p>
                                {item.schedule.includeImage && (
                                  <Badge variant="secondary" className="mt-2 text-xs">
                                    With Image
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Schedule Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create New Schedule
            </CardTitle>
            <CardDescription>
              Configure your recurring post schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-semibold">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI Trends of 2025"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Frequency</Label>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2">
                {(['daily', 'weekdays', 'weekends', 'weekly'] as const).map((opt) => (
                  <Button
                    key={opt}
                    type="button"
                    variant={frequency === opt ? 'default' : 'outline'}
                    onClick={() => setFrequency(opt)}
                    className={`capitalize transition-all ${frequency === opt ? 'shadow-md scale-105' : ''}`}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {frequency === 'weekly' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label>Select Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((d) => (
                      <Button
                        key={d}
                        type="button"
                        variant={days.includes(d) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleDay(d)}
                        className="rounded-full"
                      >
                        {d}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="time">Time</Label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value as 'IST' | 'UTC')}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="IST">IST</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11"
              />
              <p className="text-sm text-muted-foreground italic">{readable()}</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ai-image"
                checked={includeImage}
                onCheckedChange={(checked) => setIncludeImage(checked === true)}
              />
              <Label htmlFor="ai-image" className="text-sm font-normal cursor-pointer">
                Include AI-generated image
              </Label>
            </div>

            <Button 
              onClick={requestSchedule} 
              disabled={loading || showPayment} 
              className="w-full bg-gradient-to-r from-neutral-900 to-neutral-900 hover:from-neutral-900 hover:to-neutral-700 text-white shadow-lg" 
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              {loading ? 'Creating...' : 'Create Schedule'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Schedules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Active Schedules
            </CardTitle>
            <CardDescription>
              Manage your recurring post schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!schedules.length ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">No schedules yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first schedule above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((s, index) => (
                  <div key={s._id} className="space-y-4">
                    {/* Schedule Info Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 rounded-xl border-2 bg-card hover:shadow-md transition-all duration-300 hover:border-primary/30"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              s.isActive ? 'bg-neutral-900/10' : 'bg-muted'
                            }`}>
                              <Clock className={`h-5 w-5 ${s.isActive ? 'text-neutral-600 dark:text-neutral-400' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg mb-2 text-foreground">{s.topic}</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <code className="bg-muted px-2.5 py-1 rounded-md text-xs font-mono border text-foreground">
                                    {s.schedule}
                                  </code>
                                  {s.includeImage && (
                                    <Badge variant="secondary" className="text-xs">
                                      📷 With Image
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-muted-foreground">
                                  <span className="font-medium">Next post:</span> {s.nextPostAt ? (() => {
                                    const dateStr = s.nextPostAt.includes('Z') || s.nextPostAt.includes('+') 
                                      ? s.nextPostAt 
                                      : s.nextPostAt + 'Z'
                                    return formatIST(new Date(dateStr))
                                  })() : 'N/A'} IST
                                </div>
                                <div className="text-muted-foreground">
                                  <span className="font-medium">Total posts:</span> {s.postCount || 0} published
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={s.isActive ? 'default' : 'secondary'}
                          className={`${s.isActive ? 'bg-neutral-900/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/30' : ''} text-sm px-3 py-1.5 h-auto whitespace-nowrap`}
                        >
                          {s.isActive ? '✓ Active' : 'Paused'}
                        </Badge>
                      </div>
                      <div className="flex gap-2 pt-4 border-t">
                        {s.isActive ? (
                          <Button
                            onClick={() => toggleScheduleState(s._id, false)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Pause className="mr-2 h-3.5 w-3.5" />
                            Pause
                          </Button>
                        ) : (
                          <Button
                            onClick={() => toggleScheduleState(s._id, true)}
                            size="sm"
                            className="flex-1 bg-neutral-900 hover:bg-neutral-700"
                          >
                            <Play className="mr-2 h-3.5 w-3.5" />
                            Resume
                          </Button>
                        )}
                        <Button
                          onClick={() => deleteSchedule(s._id)}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </motion.div>

                    {/* Post Preview Card - Similar to AI page */}
                    {(s.lastPostContent || s.content || s.lastPostImageUrl || s.imageUrl) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                      >
                        <Card className="border-2 border-primary/20">
                          <CardHeader className="p-4 sm:p-6">
                            <div className="flex flex-col gap-3">
                              <div className="flex-1 min-w-0 max-w-full">
                                <CardTitle className="text-sm sm:text-base md:text-lg font-semibold flex items-start gap-2 break-words">
                                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
                                  <span className="break-words overflow-wrap-anywhere word-break-break-word">Scheduled Post Preview</span>
                                </CardTitle>
                                <CardDescription className="mt-1 text-xs sm:text-sm break-words overflow-wrap-anywhere word-break-break-word">
                                  Preview of the last generated post for this schedule
                                </CardDescription>
                              </div>
                              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs sm:text-sm w-fit self-start break-words overflow-wrap-anywhere max-w-full hover:bg-primary/10">
                                <span className="break-words overflow-wrap-anywhere word-break-break-word">Topic: {s.topic}</span>
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 p-4 sm:p-6">
                            {/* Post Preview Section */}
                            <div className="space-y-3 w-full min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <Label className="text-xs sm:text-sm font-medium">Post Preview</Label>
                              </div>
                              
                              {/* Post Content Display */}
                              <div className="min-h-[200px] sm:min-h-[300px] p-4 sm:p-6 rounded-lg border-2 border-primary/20 bg-card shadow-sm w-full max-w-full overflow-x-hidden">
                                {(s.lastPostContent || s.content) && String(s.lastPostContent || s.content || '').trim() ? (
                                  <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere word-break-break-word text-sm sm:text-base md:text-lg leading-relaxed max-w-full text-foreground">
                                      {s.lastPostContent || s.content}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
                                    <div className="text-center">
                                      <p className="text-sm">No content generated yet</p>
                                      <p className="text-xs mt-1">Content will be generated when schedule runs</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Image Preview */}
                              {(s.lastPostImageUrl || s.imageUrl) ? (
                                <div className="mt-4 rounded-lg overflow-hidden border w-full max-w-full">
                                  <div className="relative w-full">
                                    <img 
                                      src={s.lastPostImageUrl || s.imageUrl} 
                                      alt="Generated post image" 
                                      className="w-full h-auto max-w-full object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                  </div>
                                  <div className="p-2 bg-muted flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                      <span className="text-xs text-muted-foreground">AI Generated Image</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                s.includeImage && (
                                  <div className="mt-4 p-4 rounded-lg border border-dashed bg-muted/50 flex flex-col items-center justify-center w-full gap-2">
                                    <div className="text-center">
                                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                      <span className="text-sm text-muted-foreground break-words">Image will be generated when schedule runs</span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Modal for Scheduling */}
      {showPayment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PaymentModal
            service="schedule_post"
            serviceName="Schedule Post"
            onSuccess={async () => {
              setShowPayment(false)
            }}
            onCancel={() => {
              setShowPayment(false)
            }}
            onServiceCall={async () => {
              if (!topic || !topic.trim()) {
                toast.error('Topic is required to create schedule')
                throw new Error('Topic is required')
              }
              
              const schedule = buildCron()
              if (!schedule) {
                toast.error('Invalid schedule configuration')
                throw new Error('Invalid schedule')
              }
              
              try {
                const { data } = await api.post('/linkedin/schedule', { 
                  topic: topic.trim(), 
                  schedule, 
                  include_image: includeImage,
                  includeImage: includeImage
                })
                
                if (data.error) {
                  const errorMsg = data.error.toLowerCase()
                  if (errorMsg.includes('already exists')) {
                    toast.success('Schedule already exists')
                  } else {
                    toast.error(data.error || 'Schedule creation failed')
                    throw new Error(data.error)
                  }
                } else if (data.schedule_id) {
                  toast.success(data.message || 'Schedule created successfully!')
                  setTopic('')
                  setIncludeImage(false)
                  setTimeout(() => {
                    loadSchedules()
                  }, 1000)
                } else {
                  toast.error('Schedule creation failed: No schedule ID returned')
                  throw new Error('No schedule ID returned')
                }
              } catch (error: any) {
                const errorMsg = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Schedule creation failed'
                toast.error(`Failed to create schedule: ${errorMsg}`)
                throw error
              }
            }}
          />
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteScheduleId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="border-2 border-destructive/20 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-destructive/10 p-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">Delete Schedule</CardTitle>
                        <CardDescription className="mt-1">
                          This action cannot be undone
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete this schedule? All scheduled posts for this schedule will be cancelled.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={confirmDelete}
                      disabled={deleting}
                      variant="destructive"
                      className="flex-1"
                      size="lg"
                    >
                      {deleting ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Schedule
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

