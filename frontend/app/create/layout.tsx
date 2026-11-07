import { ProtectedRoute } from '@/components/protected-route'
import { AppShell } from '@/components/app-shell'

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}
