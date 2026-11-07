'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import api from '@/lib/api'
import { PaymentModal } from '@/components/web3/PaymentModal'
import { FileText, Plus, Trash2, Copy, CheckCircle2, Edit2, Save, X } from 'lucide-react'

interface Template {
  id: string
  name: string
  content: string
  description?: string
  created_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    description: ''
  })
  const [templateContent, setTemplateContent] = useState('')
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/linkedin/templates')
      if (data.error) {
        toast.error(data.error)
        return
      }
      setTemplates(data.templates || [])
    } catch (e: any) {
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const requestCreateTemplate = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Please fill in name and content')
      return
    }

    setShowPayment(true)
  }

  const executeCreateTemplate = async () => {
    try {
      const { data } = await api.post('/linkedin/templates/create', formData)
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('Template created!')
      setShowCreate(false)
      setFormData({ name: '', content: '', description: '' })
      loadTemplates()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to create template')
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return
    try {
      const { data } = await api.post('/linkedin/templates/delete', { template_id: id })
      if (data.error) {
        toast.error(data.error)
        return
      }
      toast.success('Template deleted!')
      loadTemplates()
    } catch (e: any) {
      toast.error('Failed to delete template')
    }
  }

  const useTemplate = async (id: string) => {
    try {
      const { data } = await api.post('/linkedin/templates/use', {
        template_id: id,
        variables: {}
      })
      if (data.error) {
        toast.error(data.error)
        return
      }
      setTemplateContent(data.content)
      setEditingId(id)
      toast.success('Template loaded!')
    } catch (e: any) {
      toast.error('Failed to use template')
    }
  }

  const copyTemplate = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
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
              <FileText className="h-6 w-6" />
              Post Templates
            </CardTitle>
            <CardDescription>
              Save and reuse your favorite post structures. Use variables like {'{{variable_name}}'} for customization.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">My Templates</CardTitle>
              <CardDescription>Manage your saved templates</CardDescription>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg border bg-muted/50 space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Job Offer Template"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter template content. Use {{variable_name}} for placeholders."
                    className="min-h-[150px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={requestCreateTemplate} className="flex-1" disabled={showPayment}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowCreate(false)
                    setFormData({ name: '', content: '', description: '' })
                  }}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading templates...</p>
            ) : templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No templates yet. Create one above!
              </p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          {template.description && (
                            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => useTemplate(template.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyTemplate(template.content, template.id)}
                          >
                            {copiedId === template.id ? (
                              <CheckCircle2 className="h-4 w-4 text-neutral-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {editingId === template.id && templateContent && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={templateContent}
                            onChange={(e) => setTemplateContent(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={async () => {
                                await api.post('/linkedin/templates/create', {
                                  name: template.name,
                                  content: templateContent,
                                  description: template.description
                                })
                                toast.success('Updated!')
                                setEditingId(null)
                                loadTemplates()
                              }}
                            >
                              <Save className="mr-2 h-3 w-3" />
                              Save Changes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(null)
                                setTemplateContent('')
                              }}
                            >
                              <X className="mr-2 h-3 w-3" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      {editingId !== template.id && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                          {template.content}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Modal */}
      {showPayment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PaymentModal
            service="templates"
            serviceName="Create Template"
            // The service itself is run by PaymentModal via onServiceCall —
            // onSuccess only closes the modal so the action never executes twice.
            onSuccess={async (_txHash: string) => {
              setShowPayment(false)
            }}
            onCancel={() => setShowPayment(false)}
            onServiceCall={async () => {
              await executeCreateTemplate()
              setShowCreate(false)
              setFormData({ name: '', content: '', description: '' })
              loadTemplates()
            }}
          />
        </motion.div>
      )}
    </div>
  )
}

