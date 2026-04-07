import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { listConnections } from '@/actions/connections'
import AppHeader from '@/components/app/app-header'
import ConnectionList from '@/components/connections/connection-list'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import authOptions from '@/lib/auth-options'

import { CheckCircle2, Inbox, Mail } from 'lucide-react'

export default async function ConnectionsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  let connections = []
  let error = null

  try {
    connections = await listConnections()
  } catch (err) {
    error = err.message || 'Failed to load connections'
  }

  const allConnected =
    connections.length === 0 ||
    connections.every((c) => c.status === 'authenticated')

  return (
    <div className="min-h-screen bg-background">
      <AppHeader session={session} />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">
                Configuration Error
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <p>
                Make sure <code>CHATBOTKIT_API_SECRET</code> and{' '}
                <code>CHATBOTKIT_BOT_ID</code> are set in your environment
                variables.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {allConnected ? (
              <Card className="border-green-200 dark:border-green-900">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                      <CardTitle>Agent Ready</CardTitle>
                      <CardDescription>
                        All connections are active. Your Inbox Agent is fully
                        configured and ready to process your emails.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="gap-2">
                    <Link href="/dashboard">
                      <Inbox className="h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Setup Required</CardTitle>
                  <CardDescription>
                    Connect the services below to activate your Inbox Agent.
                    Once all connections are established, your agent will start
                    processing emails automatically.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <ConnectionList connections={connections} />
          </>
        )}
      </main>
    </div>
  )
}
