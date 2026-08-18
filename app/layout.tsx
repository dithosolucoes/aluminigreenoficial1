import './globals.css'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { AuthProvider } from '@/components/auth/auth-provider'
import { assertRealModeConfig } from '@/lib/config'
import { ToastProvider } from '@/components/providers/toaster-provider'
import { ConfettiProvider } from '@/components/providers/confetti-provider'

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Alumini Green - Educação, Inovação e Gestão Empresarial',
  description: 'Desenvolva habilidades práticas que conectam sustentabilidade, inovação e crescimento real com os especialistas.',
}

// Com MOCK_MODE=false, quebra já no boot com a lista do que falta — melhor
// do que descobrir no meio de uma compra.
assertRealModeConfig();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <html lang="pt-BR">
        <body className={plusJakartaSans.className}>
          <ConfettiProvider />
          <ToastProvider />
          {children}
        </body>
      </html>
    </AuthProvider>
  )
}