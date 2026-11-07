'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import api from '@/lib/api'
import { History, ExternalLink, RefreshCw, ArrowLeft, ArrowRight, Calendar, DollarSign, Hash, FileText, Loader2 } from 'lucide-react'

interface Transaction {
  id: string
  tx_hash: string
  service: string
  amount: string
  status: string
  from_address?: string
  created_at: string
  updated_at: string
  explorer_url?: string
  actual_tx_id?: string
  is_processing?: boolean
}

interface PaymentHistory {
  success: boolean
  payments: Transaction[]
  total_count: number
  total_spent: string
  error?: string
}

const SERVICE_NAMES: Record<string, string> = {
  'dashboard_access': 'Dashboard Access',
  'linkedin_post': 'LinkedIn Post',
  'linkedin_post_with_image': 'LinkedIn Post with Image',
  'ai_generate_post': 'AI Generate Post',
  'ai_generate_post_with_image': 'AI Generate Post with Image',
  'schedule_post': 'Schedule Post',
  'url_to_post': 'URL to Post',
  'post_ideas': 'Post Ideas',
  'templates': 'Templates',
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSpent, setTotalSpent] = useState('0')
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async (page: number = 0) => {
    setLoading(true)
    setError(null)
    try {
      const offset = page * pageSize
      const response = await api.get<PaymentHistory>('/api/payment/history', {
        params: {
          limit: pageSize,
          offset: offset,
        },
      })

      if (response.data.success) {
        setTransactions(response.data.payments || [])
        setTotalSpent(response.data.total_spent || '0')
        setTotalCount(response.data.total_count || 0)
        setCurrentPage(page)
      } else {
        setError(response.data.error || 'Failed to fetch transactions')
        toast.error(response.data.error || 'Failed to fetch transactions')
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || e.message || 'Failed to fetch transactions'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(0)
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
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

  const formatServiceName = (service: string) => {
    return SERVICE_NAMES[service] || service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const handleRefresh = () => {
    fetchTransactions(currentPage)
  }

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      fetchTransactions(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      fetchTransactions(currentPage + 1)
    }
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <History className="h-6 w-6" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  View all your FET/Stripe payment transactions with blockchain explorer links
                </CardDescription>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold mt-1">{totalCount}</p>
              </div>
              <Hash className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold mt-1">{parseFloat(totalSpent).toFixed(2)} FET/Stripe</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Page</p>
                <p className="text-2xl font-bold mt-1">{currentPage + 1} / {totalPages || 1}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading transactions...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No transactions found</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Your payment transactions will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={tx.status === 'verified' ? 'default' : 'secondary'}
                            className={
                              tx.status === 'verified'
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                                : ''
                            }
                          >
                            {tx.status}
                          </Badge>
                          <Badge variant="outline">
                            {formatServiceName(tx.service)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{parseFloat(tx.amount).toFixed(2)} FET/Stripe</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Hash className="h-4 w-4" />
                            <span className="font-mono text-xs truncate max-w-[300px]">{tx.tx_hash}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(tx.created_at)}</span>
                          </div>
                          {tx.from_address && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="text-xs">From:</span>
                              <span className="font-mono text-xs truncate max-w-[200px]">{tx.from_address}</span>
                            </div>
                          )}
                          {tx.is_processing && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                              <span className="text-xs">⏳ Transaction is still processing</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {tx.explorer_url ? (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            <a
                              href={tx.explorer_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on Explorer
                            </a>
                          </Button>
                        ) : tx.is_processing ? (
                          <Badge variant="secondary" className="whitespace-nowrap">
                            Processing...
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && transactions.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage * pageSize) + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0 || loading}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground px-4">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1 || loading}
                    variant="outline"
                    size="sm"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

