'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useLinkedIn } from '@/contexts/LinkedInContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatIST } from '@/lib/utils'
import { PenSquare, Bot, Calendar, CheckCircle2, User, Link as LinkIcon, Sparkles, FileText, Plus, Trash2, X, CheckCircle, Circle, TrendingUp, Clock, Zap, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description?: string
  date: string // YYYY-MM-DD format
  completed: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { connected, profile } = useLinkedIn()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskDate, setNewTaskDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('dashboard_tasks')
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (e) {
        // Failed to load tasks
      }
    }
  }, [])

  // Save tasks to localStorage
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('dashboard_tasks')) {
      localStorage.setItem('dashboard_tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title')
      return
    }
    if (!newTaskDate) {
      toast.error('Please select a date')
      return
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      date: newTaskDate,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [...prev, newTask].sort((a, b) => {
      // Sort by date, then by created time
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }))
    setNewTaskTitle('')
    setNewTaskDescription('')
    setShowAddTask(false)
    toast.success('Task added successfully!')
  }

  const toggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
    toast.success('Task deleted')
  }

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!acc[task.date]) {
      acc[task.date] = []
    }
    acc[task.date].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Get sorted dates
  const sortedDates = Object.keys(tasksByDate).sort()

  // Filter tasks for selected date
  const filteredTasks = selectedDate
    ? tasksByDate[selectedDate] || []
    : sortedDates.length > 0
    ? tasksByDate[sortedDates[0]] || []
    : []

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const taskDate = new Date(date)
    taskDate.setHours(0, 0, 0, 0)

    const diffTime = taskDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })

    if (diffDays === 0) return `Today (${formatted})`
    if (diffDays === 1) return `Tomorrow (${formatted})`
    if (diffDays === -1) return `Yesterday (${formatted})`
    if (diffDays > 0) return `In ${diffDays} days (${formatted})`
    return formatted
  }

  const quickActions = [
    { href: '/create', icon: PenSquare, label: 'Create Post', description: 'Share updates', color: 'from-blue-500 to-blue-600' },
    { href: '/ai', icon: Bot, label: 'AI Generator', description: 'Generate content', color: 'from-purple-500 to-purple-600' },
    { href: '/schedule', icon: Calendar, label: 'Scheduler', description: 'Schedule posts', color: 'from-green-500 to-green-600' },
    { href: '/url-to-post', icon: LinkIcon, label: 'URL to Post', description: 'Convert URLs to posts', color: 'from-orange-500 to-orange-600' },
    { href: '/ideas', icon: Sparkles, label: 'Post Ideas', description: 'Generate ideas', color: 'from-pink-500 to-pink-600' },
    { href: '/templates', icon: FileText, label: 'Templates', description: 'Save & reuse posts', color: 'from-indigo-500 to-indigo-600' },
  ]

  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const todayTasks = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0]
    return t.date === today && !t.completed
  }).length

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg">
          <CardHeader className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                      Welcome Back! 👋
                    </CardTitle>
                    <CardDescription className="text-base md:text-lg mt-1">
                      {formatIST(new Date())} IST
                    </CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage your content creation workflow from one place. Create, schedule, and analyze your LinkedIn posts effortlessly.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {connected && profile && (
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm w-full sm:w-auto">
                    <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/20">
                      <AvatarImage src={profile.picture} alt={profile.name || 'LinkedIn'} />
                      <AvatarFallback className="bg-primary/10">
                        {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold">{profile.name || 'LinkedIn User'}</div>
                      <div className="text-xs text-muted-foreground">LinkedIn Profile</div>
                    </div>
                  </div>
                )}
                <Badge
                  variant={connected ? 'default' : 'secondary'}
                  className={`${connected ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' : 'border-2 bg-muted'} text-sm px-4 py-2 h-auto whitespace-nowrap shadow-sm`}
                >
                  {connected ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      <span>LinkedIn Connected</span>
                    </>
                  ) : (
                    <>
                      <span>LinkedIn Not Connected</span>
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="border-2 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</p>
                <p className="text-3xl font-bold">{totalTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Today's Tasks</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{todayTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Progress</p>
                <p className="text-3xl font-bold text-primary">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Todo/Task List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-2">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  My Tasks
                </CardTitle>
                <CardDescription className="mt-1">
                  Manage your daily tasks and work items
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowAddTask(!showAddTask)}
                className="w-full sm:w-auto"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {/* Add Task Form */}
            <AnimatePresence>
              {showAddTask && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Card className="border-2 border-primary/30 bg-primary/5">
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-title">Task Title *</Label>
                        <Input
                          id="task-title"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="e.g., Create LinkedIn post about AI trends"
                          className="w-full"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              addTask()
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-description">Description (Optional)</Label>
                        <Textarea
                          id="task-description"
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                          placeholder="Add details about the task..."
                          className="min-h-[80px] resize-y"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-date">Date *</Label>
                        <Input
                          id="task-date"
                          type="date"
                          value={newTaskDate}
                          onChange={(e) => setNewTaskDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addTask} className="flex-1">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Add Task
                        </Button>
                        <Button
                          onClick={() => {
                            setShowAddTask(false)
                            setNewTaskTitle('')
                            setNewTaskDescription('')
                          }}
                          variant="outline"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Date Filter */}
            {sortedDates.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2 border-b">
                <Button
                  variant={selectedDate === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                  className="text-xs"
                >
                  All Dates
                </Button>
                {sortedDates.map((date) => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDate(date)}
                    className="text-xs"
                  >
                    {formatDisplayDate(date)}
                  </Button>
                ))}
              </div>
            )}

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium">No tasks yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Add Task" to create your first task
                </p>
              </div>
            ) : selectedDate && !tasksByDate[selectedDate] ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tasks for selected date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDate ? (
                  // Show tasks for selected date
                  tasksByDate[selectedDate]?.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={toggleTaskComplete}
                      onDelete={deleteTask}
                    />
                  ))
                ) : (
                  // Show all tasks grouped by date
                  sortedDates.map((date) => (
                    <div key={date} className="space-y-2">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Calendar className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm text-foreground">
                          {formatDisplayDate(date)}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {tasksByDate[date].length} task{tasksByDate[date].length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="space-y-2 pl-6">
                        {tasksByDate[date].map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggleComplete={toggleTaskComplete}
                            onDelete={deleteTask}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Quick Actions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Access all your content creation tools in one place
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="h-full group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 cursor-pointer overflow-hidden relative bg-gradient-to-br from-background to-muted/20">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <CardContent className="p-6 flex flex-col space-y-4 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${action.color}`} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {action.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-xs text-primary font-medium group-hover:underline">
                        Get Started →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// Task Item Component
function TaskItem({
  task,
  onToggleComplete,
  onDelete,
}: {
  task: Task
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="group"
    >
      <Card
        className={`border-2 transition-all duration-200 hover:shadow-md ${
          task.completed
            ? 'bg-muted/50 border-muted opacity-75'
            : 'hover:border-primary/50'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => onToggleComplete(task.id)}
              className="mt-1 flex-shrink-0 hover:scale-110 transition-transform"
            >
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h3
                className={`font-medium ${
                  task.completed
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`text-sm mt-1 ${
                    task.completed
                      ? 'text-muted-foreground line-through'
                      : 'text-muted-foreground'
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>
            <Button
              onClick={() => onDelete(task.id)}
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
