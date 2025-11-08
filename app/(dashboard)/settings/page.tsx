import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[hsl(var(--color-text-primary))]">
          Settings
        </h1>
        <p className="text-[hsl(var(--color-text-secondary))] mt-2">
          Manage your account and application preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[hsl(var(--color-text-secondary))]">
            Profile settings coming soon...
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme Preferences</CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[hsl(var(--color-text-secondary))]">
            Theme customization coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
