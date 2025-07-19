"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ValidatorMap } from "../interactive/ValidatorMap"
import { Users, Globe, Shield } from "lucide-react"

export function ValidatorNetworkSection() {
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
    <section className="w-full py-12 md:py-24 lg:py-32">
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
                Global Validator Network
              </span>
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our worldwide network of human validators ensures accurate monitoring from every region
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full max-w-4xl pt-8">
            <Card className="border-2 border-blue-600/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-blue-600" />
                  Live Validator Network
                </CardTitle>
                <CardDescription>Real-time view of active validators monitoring websites globally</CardDescription>
              </CardHeader>
              <CardContent>
                <ValidatorMap />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div className="grid gap-6 sm:grid-cols-3 pt-8 w-full max-w-4xl" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <Card className="text-center">
                <CardHeader>
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle>1,247+</CardTitle>
                  <CardDescription>Active Validators</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="text-center">
                <CardHeader>
                  <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle>50+</CardTitle>
                  <CardDescription>Countries Covered</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="text-center">
                <CardHeader>
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle>99.9%</CardTitle>
                  <CardDescription>Network Reliability</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
