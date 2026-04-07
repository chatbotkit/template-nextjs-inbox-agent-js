'use server'

import { getBotId, getChatBotKitClient } from '@/lib/chatbotkit'
import { generateFingerprint } from '@/lib/contact'
import { requireSession } from '@/lib/session'

const cbk = getChatBotKitClient()

/**
 * Pre-defined task catalog. Each task has a fixed name, description, and
 * schedule. Users simply toggle tasks on or off - they cannot create custom
 * tasks or change the schedule.
 */
const TASK_CATALOG = [
  {
    key: 'email-drafting',
    name: 'Draft Email Responses',
    description:
      'Scan my inbox for new and unread emails. For each email that needs a reply, analyze the content, determine its priority, and draft a thoughtful response. Save drafts for my review.',
    schedule: '@every 1h',
    icon: 'edit',
  },
  {
    key: 'email-categorization',
    name: 'Categorize & Label Emails',
    description:
      'Go through my inbox and categorize each email by type (e.g. urgent, follow-up, newsletter, notification). Apply appropriate labels and flag high-priority messages.',
    schedule: '@every 1h',
    icon: 'tag',
  },
  {
    key: 'daily-digest',
    name: 'Daily Inbox Digest',
    description:
      'Generate a daily summary of my inbox activity. Include key metrics like total new emails, emails by category, pending replies, and highlight the most important messages that need my attention.',
    schedule: '@every 1d',
    icon: 'file-text',
  },
]

/**
 * Ensures a ChatBotKit contact exists for the authenticated user and returns
 * its ID.
 *
 * @returns {Promise<string>} The contact ID
 */
async function ensureContact() {
  const { session } = await requireSession()

  const { id: contactId } = await cbk.contact.ensure({
    fingerprint: generateFingerprint(session.user.email),
    email: session.user.email,
    name: session.user.name || '',
  })

  return contactId
}

/**
 * Lists all tasks for the current contact and maps them against the
 * pre-defined catalog to determine which tasks are enabled (on) or
 * disabled (off).
 *
 * @returns {Promise<Array<{
 *   key: string,
 *   name: string,
 *   description: string,
 *   schedule: string,
 *   icon: string,
 *   enabled: boolean,
 *   taskId: string | null,
 *   status: string,
 *   outcome: string,
 * }>>}
 */
export async function getTaskStates() {
  const contactId = await ensureContact()

  let existingTasks = []

  try {
    const { items } = await cbk.contact.task.list(contactId, {
      order: 'desc',
      take: 100,
    })

    existingTasks = items
  } catch {
    // @note if listing fails, all tasks appear as disabled
  }

  return TASK_CATALOG.map((catalogTask) => {
    // @note match by name since we control task creation
    const match = existingTasks.find((t) => t.name === catalogTask.name)

    return {
      key: catalogTask.key,
      name: catalogTask.name,
      description: catalogTask.description,
      schedule: catalogTask.schedule,
      icon: catalogTask.icon,
      enabled: !!match,
      taskId: match?.id || null,
      status: match?.status || 'idle',
      outcome: match?.outcome || 'pending',
    }
  })
}

/**
 * Enables a pre-defined task by creating it via the ChatBotKit task API.
 *
 * @param {string} taskKey - The key from TASK_CATALOG to enable
 * @returns {Promise<{ id: string }>}
 */
export async function enableTask(taskKey) {
  const contactId = await ensureContact()
  const botId = getBotId()

  const catalogTask = TASK_CATALOG.find((t) => t.key === taskKey)

  if (!catalogTask) {
    throw new Error(`Unknown task: ${taskKey}`)
  }

  const task = await cbk.task.create({
    name: catalogTask.name,
    description: catalogTask.description,
    contactId,
    botId,
    schedule: catalogTask.schedule,
  })

  return { id: task.id }
}

/**
 * Disables a task by deleting it from ChatBotKit.
 *
 * @param {string} taskId - The ChatBotKit task ID to delete
 * @returns {Promise<{ ok: boolean }>}
 */
export async function disableTask(taskId) {
  await ensureContact()

  await cbk.task.delete(taskId)

  return { ok: true }
}
