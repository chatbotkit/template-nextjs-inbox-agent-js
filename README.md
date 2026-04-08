# Inbox Agent Template for Next.js / ChatBotKit / JS

An autonomous email inbox management agent powered by ChatBotKit. Sign in with Google, connect the personal secrets required by your ChatBotKit bot, then toggle pre-defined tasks on and off to let the agent draft responses, categorize emails, and generate daily digests automatically.

<img width="30%" src="https://github.com/user-attachments/assets/763acf3e-f640-4494-be7f-6f239a1494ad" /> <img width="30%" src="https://github.com/user-attachments/assets/ffe794f7-795f-4984-8cd2-643c10bab086" /> <img width="30%" src="https://github.com/user-attachments/assets/1211c910-a424-4b0b-a8f3-1e9f533ef064" />

> **Note:** This template is deliberately bare-bones. It provides the minimal structure and wiring needed to get a working app, intentionally leaving styling, layout, and architectural choices open so you can build on top without fighting existing opinions.

## Why ChatBotKit?

ChatBotKit provides the conversational AI backbone that powers the Inbox Agent's email processing. Instead of building complex NLP pipelines from scratch, you get:

- **Pre-built AI models** for understanding email context, sentiment, and intent
- **Task scheduling** for automated, recurring inbox processing
- **Bot customization** to tailor how your inbox agent behaves
- **Server-side SDK** for secure, authenticated API calls
- **Personal secrets** for secure OAuth connection management (Gmail, etc.)

## Features

- **Google OAuth Sign-In** - Secure authentication using your Google account
- **Dedicated Connections Page** - Connect and manage the integrations required by your bot via ChatBotKit personal secrets with connect/revoke controls
- **Pre-Defined Tasks** - Three built-in tasks (email drafting, categorization, daily digest) that users simply toggle on or off
- **Autonomous Operation** - The ChatBotKit bot handles email processing through its configured abilities on automatic schedules
- **ChatBotKit Integration** - Powered by ChatBotKit's task, contact, and GraphQL APIs

## Technology Stack

- **Next.js 16** - App Router with server actions
- **ChatBotKit SDK** - `@chatbotkit/sdk` for server-side operations (tasks, contacts, connections)
- **next-auth** - Authentication with Google OAuth provider
- **shadcn/ui** - Accessible UI components built on Radix primitives
- **Tailwind CSS** - Utility-first styling

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

### 3. Set up Google OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Create OAuth 2.0 credentials (Web application type)
4. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
5. Copy the Client ID and Client Secret to your `.env.local`

### 4. Set up ChatBotKit

1. Create an account at [ChatBotKit](https://chatbotkit.com)
2. Create a new bot with the email abilities and personal secrets your workflow needs
3. Copy your API secret token from [Tokens](https://chatbotkit.com/tokens)
4. Add the bot ID and API secret to your `.env.local`

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

## Environment Variables

| Variable                | Description                                   |
| ----------------------- | --------------------------------------------- |
| `CHATBOTKIT_API_SECRET` | Your ChatBotKit API secret token              |
| `CHATBOTKIT_BOT_ID`     | The bot ID configured with Gmail abilities    |
| `NEXTAUTH_SECRET`       | Random string for NextAuth session encryption |
| `NEXTAUTH_URL`          | Your app URL (e.g., `http://localhost:3000`)  |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID (for user sign-in)     |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth client secret                    |

## How It Works

### Authentication Flow

1. User signs in via Google OAuth (basic profile/email scopes only)
2. NextAuth manages the session with JWT strategy
3. Protected routes redirect unauthenticated users to the sign-in page

### Connections Flow

1. After sign-in, the `/connect` page lists all personal secrets required by the configured ChatBotKit bot
2. Each connection shows its authentication status (connected/disconnected)
3. Users click "Connect" to authenticate via OAuth popup (managed by ChatBotKit)
4. OAuth callbacks are handled via `postMessage` to update connection status in real time
5. Users can revoke connections at any time with a confirmation dialog

### Task Toggle Flow

1. Once all connections are established, the dashboard shows pre-defined tasks
2. Each task has a simple on/off toggle - no configuration needed
3. Turning a task on creates it in ChatBotKit with its pre-set schedule
4. Turning a task off deletes it from ChatBotKit, stopping execution
5. Task status (active, running, error) is displayed in real time

### Pre-Defined Tasks

| Task                      | Description                                                 | Schedule   |
| ------------------------- | ----------------------------------------------------------- | ---------- |
| Draft Email Responses     | Scans inbox, analyzes emails, and drafts replies for review | Every hour |
| Categorize & Label Emails | Categorizes emails by type and applies labels               | Every hour |
| Daily Inbox Digest        | Generates a summary of inbox activity and highlights        | Daily      |

### Autonomous Operation

The template leverages ChatBotKit's task system for autonomous email processing:

- Users sign in and connect their services once
- They toggle on the tasks they want the agent to perform
- The ChatBotKit task scheduler runs the bot automatically on each task's schedule
- The bot uses its Gmail abilities (via personal secrets) to process emails autonomously
- No manual intervention needed after initial setup

## Project Structure

```
actions/
  connections.js         # Server actions: listConnections, revokeConnection
  tasks.js               # Server actions: getTaskStates, enableTask, disableTask + task catalog
app/
  layout.jsx             # Root layout with providers
  page.jsx               # Landing page (redirects to /connect or /auth)
  auth/signin/page.jsx   # Google sign-in page
  connect/page.jsx       # Connections page (server: lists connections + ConnectionList)
  dashboard/
    page.jsx             # Dashboard page (server: checks connections, fetches task states)
    dashboard-page.jsx   # Dashboard page (client: pre-defined task toggles)
  api/auth/[...nextauth]/
    route.ts             # NextAuth API route
components/
  app/
    app-header.jsx       # Shared authenticated header with avatar dropdown
  connections/
    connection-list.jsx  # Connection list with connect/revoke + OAuth callback handling
  providers.jsx          # Session provider wrapper
  ui/
    alert-dialog.jsx     # Alert dialog component (Radix)
    avatar.jsx           # Avatar component (shadcn/ui)
    button.jsx           # Button component (shadcn/ui)
    card.jsx             # Card component (shadcn/ui)
    dropdown-menu.jsx    # Dropdown menu component (Radix)
    separator.jsx        # Separator component (shadcn/ui)
lib/
  auth-options.js        # NextAuth configuration
  chatbotkit.js          # ChatBotKit client singleton
  contact.js             # Contact fingerprint generation (UUID v5)
  session.js             # Session validation helper
  utils.js               # Utility functions (cn)
middleware.ts            # Auth middleware for protected routes
```

## Customization

### Configuring the AI Agent

Edit your ChatBotKit bot's backstory and abilities to customize how it processes emails:

- **Gmail abilities** - Configure which Gmail actions the bot can perform (read, label, draft)
- **Priority detection** - Configure rules for what constitutes high/medium/low priority
- **Auto-labeling** - Define label categories based on email content
- **Response drafting** - Set tone, length, and style for draft replies

### Adding New Tasks

To add more pre-defined tasks, edit the `TASK_CATALOG` array in `actions/tasks.js`:

```js
{
  key: 'my-task',
  name: 'My Custom Task',
  description: 'What the agent should do...',
  schedule: '@every 1d',
  icon: 'file-text',
}
```

## Learn More

- [ChatBotKit Documentation](https://chatbotkit.com/docs)
- [ChatBotKit SDK Reference](https://chatbotkit.com/docs/node-sdk)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
