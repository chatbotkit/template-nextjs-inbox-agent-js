import 'server-only'

import { getServerSession } from 'next-auth'

import authOptions from '@/lib/auth-options'

/**
 * Returns the authenticated session or throws.
 *
 * @returns {Promise<{ session: object }>}
 * @throws {Error} If the user is not authenticated
 */
export async function requireSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  return { session }
}
