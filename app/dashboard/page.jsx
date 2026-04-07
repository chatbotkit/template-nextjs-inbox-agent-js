import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { listConnections } from '@/actions/connections'
import { getTaskStates } from '@/actions/tasks'
import authOptions from '@/lib/auth-options'

import DashboardPage from './dashboard-page'

export default async function Page() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Check if all connections are established before showing the dashboard
  let allConnected = false

  try {
    const connections = await listConnections()

    allConnected =
      connections.length === 0 ||
      connections.every((c) => c.status === 'authenticated')
  } catch {
    // If we can't check connections, redirect to the connect page
  }

  if (!allConnected) {
    redirect('/connect')
  }

  let taskStates = []

  try {
    taskStates = await getTaskStates()
  } catch {
    // Non-blocking: dashboard will show tasks as disabled
  }

  return <DashboardPage session={session} initialTaskStates={taskStates} />
}
