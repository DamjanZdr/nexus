import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">
          Dashboard
        </h1>
        <p className="text-[hsl(var(--color-text-secondary))] mt-2">
          Welcome to Nexus CRM
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Clients</CardTitle>
            <CardDescription>Active clients in system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Cases</CardTitle>
            <CardDescription>Cases in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Tasks</CardTitle>
            <CardDescription>Tasks requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[hsl(var(--color-text-secondary))]">No recent activity</p>
        </CardContent>
      </Card>
    </div>
  )
}
