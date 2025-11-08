import { Navbar } from '@/components/layout/Navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))]">
      <Navbar />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
