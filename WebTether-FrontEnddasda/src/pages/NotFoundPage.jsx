"use client"
import { Navbar } from "../components/ui/navbar"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const bounce = {
  initial: { y: 0 },
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 1,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "easeInOut",
    },
  },
}

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 text-center">
        <div>
          <h1 className="text-4xl font-bold text-red-500 mb-4" variants={fadeIn} initial="hidden" animate="visible">
            404 - Not Found
          </h1>
          <p className="text-muted-foreground text-lg mb-8" variants={fadeIn} initial="hidden" animate="visible">
            Sorry, the page you are looking for does not exist.
          </p>
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <motion.div variants={bounce} initial="initial" animate="animate">
              <Home className="w-16 h-16 text-muted-foreground" />
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

