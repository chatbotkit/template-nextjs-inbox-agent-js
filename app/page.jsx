import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import authOptions from '@/lib/auth-options'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/connect')
  }

  redirect('/auth/signin')
}
