"use client"

import { useState } from "react"

// Unique ID for toast
let id = 0
function generateId() {
  return id++
}

// Create a custom hook for toast notifications
export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = ({ title, description, type = "default", duration = 5000 }) => {
    const newToast = {
      id: generateId(),
      title,
      description,
      type,
      duration,
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    return newToast.id
  }

  const dismiss = (toastId) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId))
  }

  const dismissAll = () => {
    setToasts([])
  }

  return {
    toast,
    dismiss,
    dismissAll,
    toasts,
  }
}

