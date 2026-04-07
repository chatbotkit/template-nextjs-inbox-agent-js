'use client'

import { useCallback, useState } from 'react'

import { disableTask, enableTask, getTaskStates } from '@/actions/tasks'
import AppHeader from '@/components/app/app-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import {
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  Loader2,
  Mail,
  Tag,
  XCircle,
} from 'lucide-react'

const ICON_MAP = {
  edit: Edit,
  tag: Tag,
  'file-text': FileText,
}

function TaskStatusBadge({ status, outcome, enabled }) {
  if (!enabled) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        Off
      </span>
    )
  }

  if (status === 'running') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        Running
      </span>
    )
  }

  if (outcome === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    )
  }

  if (outcome === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="w-3 h-3" />
        Error
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
      <CheckCircle2 className="w-3 h-3" />
      Active
    </span>
  )
}

function formatSchedule(schedule) {
  switch (schedule) {
    case '@every 1h':
      return 'Runs every hour'
    case '@every 6h':
      return 'Runs every 6 hours'
    case '@every 12h':
      return 'Runs every 12 hours'
    case '@every 1d':
      return 'Runs daily'
    case '@every 7d':
      return 'Runs weekly'
    default:
      return schedule
  }
}

function TaskToggleCard({ task, onToggle, toggling }) {
  const Icon = ICON_MAP[task.icon] || Mail
  const isToggling = toggling === task.key

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium">{task.name}</p>
          <TaskStatusBadge
            status={task.status}
            outcome={task.outcome}
            enabled={task.enabled}
          />
        </div>
        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatSchedule(task.schedule)}
        </div>
      </div>
      <div className="shrink-0 mt-0.5">
        <Button
          size="sm"
          variant={task.enabled ? 'destructive' : 'default'}
          disabled={isToggling}
          onClick={() => onToggle(task)}
          className="min-w-[70px]"
        >
          {isToggling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : task.enabled ? (
            'Turn Off'
          ) : (
            'Turn On'
          )}
        </Button>
      </div>
    </div>
  )
}

export default function DashboardPage({ session, initialTaskStates }) {
  const [taskStates, setTaskStates] = useState(initialTaskStates || [])
  const [toggling, setToggling] = useState(null)

  const refreshTasks = useCallback(async () => {
    try {
      const fresh = await getTaskStates()
      setTaskStates(fresh)
    } catch {
      // @note refresh errors are non-blocking
    }
  }, [])

  const handleToggle = useCallback(
    async (task) => {
      setToggling(task.key)

      try {
        if (task.enabled && task.taskId) {
          // Optimistically mark as disabled
          setTaskStates((prev) =>
            prev.map((t) =>
              t.key === task.key ? { ...t, enabled: false, taskId: null } : t
            )
          )

          await disableTask(task.taskId)
        } else {
          // Optimistically mark as enabled
          setTaskStates((prev) =>
            prev.map((t) => (t.key === task.key ? { ...t, enabled: true } : t))
          )

          await enableTask(task.key)
        }

        await refreshTasks()
      } catch (err) {
        console.error('[Dashboard] Toggle failed:', err)
        await refreshTasks()
      } finally {
        setToggling(null)
      }
    },
    [refreshTasks]
  )

  const enabledCount = taskStates.filter((t) => t.enabled).length

  return (
    <div className="min-h-screen bg-background">
      <AppHeader session={session} />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Status */}
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div>
                <CardTitle>Agent Active</CardTitle>
                <CardDescription>
                  All connections are established. Turn on the tasks below to
                  let your agent manage your inbox automatically.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Separator />

        {/* Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <span className="text-sm text-muted-foreground">
              {enabledCount} of {taskStates.length} active
            </span>
          </div>

          <div className="space-y-3">
            {taskStates.map((task) => (
              <TaskToggleCard
                key={task.key}
                task={task}
                onToggle={handleToggle}
                toggling={toggling}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
