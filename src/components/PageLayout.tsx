import React from 'react'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className="relative w-full min-h-screen bg-transparent">
      <div className={`relative z-10 ${className}`}>
        {children}
      </div>
    </div>
  )
}
