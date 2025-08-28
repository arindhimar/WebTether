import { Wifi, Github } from "lucide-react"
import { Separator } from "../ui/separator"

export function Footer() {
  return (
    <footer className="w-full border-t border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
      <div className="container px-4 md:px-6 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                <Wifi className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Web-Tether
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Decentralized website monitoring with human validators and blockchain incentives.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Product</h4>
            <div className="space-y-2 text-sm">
              <a
                href="#features"
                className="block text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#"
                className="block text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Pricing
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Community</h4>
            <div className="space-y-2 text-sm">
              <a
                href="https://github.com/web-tether"
                className="block text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="block text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Discord
              </a>
              <a
                href="#"
                className="block text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Documentation
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Legal</h4>
            <div className="space-y-2 text-sm">
              <a
                href="#"
                className="block text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="block text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="block text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">© 2025 Web-Tether. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/web-tether"
              className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
