"use client"

import { Logo } from "./Logo"

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <Logo size="large" animated={true} />
      <div className="mt-8 flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="text-lg text-foreground">{message}</p>
      </div>
    </div>
  )
}

