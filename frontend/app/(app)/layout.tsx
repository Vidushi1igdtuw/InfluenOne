import { ProtectedRoute } from '@/components/protected-route'
import { PaymentGate } from '@/components/web3/PaymentGate'
import { AppShell } from '@/components/app-shell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <PaymentGate>
        <AppShell>{children}</AppShell>
      </PaymentGate>
    </ProtectedRoute>
  )
}
