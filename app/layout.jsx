import './globals.css'

import Providers from '@/components/providers'

export const metadata = {
  title: 'Inbox Agent',
  description:
    'An autonomous email inbox agent powered by ChatBotKit - manages your email automatically',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
