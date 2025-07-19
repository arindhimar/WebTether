"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ChevronDown } from "lucide-react"

export function FAQSection() {
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      question: "How does the validator system work?",
      answer:
        "Validators are real people who manually ping websites and report their status. They earn coins for accurate monitoring and can be flagged by the community for poor performance.",
    },
    {
      question: "What makes Web-Tether different from other monitoring services?",
      answer:
        "Unlike automated systems, Web-Tether uses human validators for more accurate, real-world monitoring. Our decentralized approach eliminates single points of failure and provides region-specific insights.",
    },
    {
      question: "How do I become a validator?",
      answer:
        "Sign up for an account, complete the validator onboarding process, and start earning coins by monitoring websites. The community will rate your performance to maintain quality standards.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use Clerk for secure authentication and follow industry best practices for data protection. All monitoring data is encrypted and stored securely.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div className="space-y-2" variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to know about Web-Tether
            </p>
          </motion.div>

          <motion.div className="w-full max-w-3xl pt-8 space-y-4" variants={containerVariants}>
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-left hover:shadow-md transition-shadow">
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <CardTitle className="flex items-center justify-between text-lg">
                      {faq.question}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-200 ${openFaq === index ? "rotate-180" : ""}`}
                      />
                    </CardTitle>
                  </CardHeader>
                  {openFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
