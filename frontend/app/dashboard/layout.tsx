import { ProtectedRoute } from '@/components/protected-route'
import { PaymentGate } from '@/components/web3/PaymentGate'
import { AppSidebar } from '@/components/app-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <PaymentGate>
        <div className="min-h-screen flex flex-col md:flex-row">
          <AppSidebar />
          <main className="flex-1 pt-[56px] sm:pt-[64px] md:pt-0 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto w-full md:ml-0 max-w-full">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </PaymentGate>
    </ProtectedRoute>
  )
}

