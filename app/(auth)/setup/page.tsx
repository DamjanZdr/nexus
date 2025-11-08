import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to Nexus CRM</CardTitle>
          <CardDescription>Set up your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input
              type="text"
              label="Display Name"
              placeholder="Enter your name"
            />
            <Input
              type="password"
              label="Password"
              placeholder="Create a password"
            />
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
            />
            <Button className="w-full" type="submit">
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
