"use client"

import { useNavigate } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle, Globe, Shield, BarChart3, Bell } from "lucide-react"
import { useEffect, useState } from "react"

export default function HomePage() {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (isSignedIn) {
      navigate("/dashboard")
    }
  }, [isSignedIn, navigate])

  if (isSignedIn) {
    return null
  }

  return (
    <div className={`flex min-h-screen flex-col dark ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <div className="rounded-full bg-gradient-to-r from-primary to-blue-400 p-1.5">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Web-Tether</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-4">
              <Link to="#features" className="text-sm font-medium transition-colors hover:text-primary">
                Features
              </Link>
              <Link to="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
                Pricing
              </Link>
              <Link to="#about" className="text-sm font-medium transition-colors hover:text-primary">
                About
              </Link>
              <Button asChild variant="ghost" className="animate-in-button">
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild variant="gradient" className="animate-in-button">
                <Link to="/sign-up">Sign Up</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-400/5 z-0"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 animate-slide-in" style={{ animationDelay: "0.1s" }}>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  <span className="gradient-text">Monitor Your Websites</span> with Confidence
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Track uptime, performance, and reliability with our powerful monitoring platform. Become a validator
                  and earn rewards for helping maintain the network.
                </p>
              </div>
              <div className="space-x-4 animate-slide-in" style={{ animationDelay: "0.3s" }}>
                <Button asChild size="lg" variant="gradient" className="animate-in-button">
                  <Link to="/sign-up" className="group">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="animate-in-button">
                  <a href="#features">Learn More</a>
                </Button>
              </div>

              <div className="mt-12 w-full max-w-5xl animate-slide-in" style={{ animationDelay: "0.5s" }}>
                <div className="relative rounded-xl border bg-card/50 shadow-xl backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-400/5"></div>
                  <div className="p-4 relative">
                    <img
                      src="/placeholder.svg?height=600&width=1200"
                      alt="Dashboard Preview"
                      className="rounded-lg shadow-lg w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <div className="animate-slide-in">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Features</span>
                <h2 className="mt-3 text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need</h2>
                <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                  Monitor your websites and earn rewards as a validator with our comprehensive platform.
                </p>
              </div>
            </div>

            <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:max-w-5xl lg:gap-12 mt-12">
              {[
                {
                  title: "Website Monitoring",
                  description: "Track uptime and performance metrics for all your websites in real-time.",
                  icon: Globe,
                  delay: "0.1s",
                },
                {
                  title: "Become a Validator",
                  description: "Earn rewards by validating website status and contributing to the network.",
                  icon: Shield,
                  delay: "0.3s",
                },
                {
                  title: "Detailed Reports",
                  description: "Get comprehensive insights into your websites' performance over time.",
                  icon: BarChart3,
                  delay: "0.5s",
                },
                {
                  title: "Instant Alerts",
                  description: "Receive notifications when your websites go down or experience issues.",
                  icon: Bell,
                  delay: "0.7s",
                },
                {
                  title: "Community Trust",
                  description: "Report suspicious validator activity to maintain network integrity.",
                  icon: CheckCircle,
                  delay: "0.9s",
                },
                {
                  title: "Reward System",
                  description: "Earn coins for successful validations and maintaining accurate data.",
                  icon: Shield,
                  delay: "1.1s",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg border bg-background p-6 shadow-md animate-slide-in animate-in-card"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-xl">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <div className="animate-slide-in">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Pricing</span>
                <h2 className="mt-3 text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
                <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                  Choose the plan that's right for you and start monitoring your websites today.
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-12">
              {[
                {
                  name: "Free",
                  description: "Perfect for individuals just getting started.",
                  price: "$0",
                  features: [
                    "Monitor up to 3 websites",
                    "Basic uptime monitoring",
                    "Email alerts",
                    "24-hour data retention",
                  ],
                  cta: "Get Started",
                  popular: false,
                  delay: "0.1s",
                },
                {
                  name: "Pro",
                  description: "Ideal for professionals and small businesses.",
                  price: "$19",
                  features: [
                    "Monitor up to 20 websites",
                    "Advanced performance metrics",
                    "SMS & email alerts",
                    "30-day data retention",
                    "Validator eligibility",
                    "API access",
                  ],
                  cta: "Start Free Trial",
                  popular: true,
                  delay: "0.3s",
                },
                {
                  name: "Enterprise",
                  description: "For organizations with advanced needs.",
                  price: "$49",
                  features: [
                    "Unlimited websites",
                    "Custom metrics & reporting",
                    "Priority alerts",
                    "1-year data retention",
                    "Premium validator status",
                    "Dedicated support",
                    "Custom integrations",
                  ],
                  cta: "Contact Sales",
                  popular: false,
                  delay: "0.5s",
                },
              ].map((plan, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col overflow-hidden rounded-lg border ${
                    plan.popular ? "border-primary shadow-lg" : ""
                  } animate-slide-in animate-in-card`}
                  style={{ animationDelay: plan.delay }}
                >
                  {plan.popular && (
                    <div className="absolute right-0 top-0">
                      <div className="rounded-bl-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        Popular
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="mt-1 text-muted-foreground">{plan.description}</p>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="ml-1 text-muted-foreground">/month</span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto p-6 pt-0">
                    <Button className="w-full" variant={plan.popular ? "gradient" : "outline"}>
                      {plan.cta}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 md:py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-primary to-blue-400 p-1.5">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Web-Tether</span>
          </div>
          <div className="flex gap-6">
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary">
              Contact
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Web-Tether. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

