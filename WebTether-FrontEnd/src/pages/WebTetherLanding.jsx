import { Header } from "../components/layout/Header"
import { Footer } from "../components/layout/Footer"
import { HeroSection } from "../components/sections/HeroSection"
import { InteractiveDemoSection } from "../components/sections/InteractiveDemoSection"
import { FeaturesSection } from "../components/sections/FeaturesSection"
import { HowItWorksSection } from "../components/sections/HowItWorksSection"
import { ValidatorNetworkSection } from "../components/sections/ValidatorNetworkSection"
import { FAQSection } from "../components/sections/FAQSection"
import { CTASection } from "../components/sections/CTASection"

export default function WebTetherLanding() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <InteractiveDemoSection />
        <ValidatorNetworkSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
