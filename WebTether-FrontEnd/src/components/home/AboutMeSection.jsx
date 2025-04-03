"use client"

import { motion } from "framer-motion"
import { User, Briefcase, GraduationCap, MapPin, LinkIcon, Award, Code, Coffee } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"

export default function AboutMeSection() {
  const profileData = {
    name: "Alex Johnson",
    title: "Full Stack Developer & Monitoring Specialist",
    location: "San Francisco, CA",
    bio: "I'm passionate about web performance and reliability. With WebTether, I monitor my projects and ensure they're always running smoothly.",
    website: "https://alexjohnson.dev",
    education: "Computer Science, Stanford University",
    avatarUrl: "/placeholder-user.jpg",
    skills: ["React", "Node.js", "AWS", "DevOps", "Performance Optimization", "Monitoring"],
    stats: {
      websites: 24,
      uptime: "99.8%",
      experience: "8+ years",
    },
  }

  return (
    <div className="container px-4 md:px-6 relative">
      <motion.div
        className="mx-auto max-w-4xl rounded-2xl border bg-card/80 backdrop-blur-sm p-8 md:p-12 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.h2
            className="text-3xl font-bold tracking-tighter sm:text-4xl gradient-text"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            The Developer Behind WebTether
          </motion.h2>
          <motion.p
            className="mt-3 text-muted-foreground"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Meet the creator and discover the passion behind this monitoring platform
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-full blur-md opacity-70"></div>
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl relative">
                <AvatarImage src={profileData.avatarUrl} />
                <AvatarFallback className="text-3xl">
                  {profileData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-3xl font-bold gradient-text">{profileData.name}</h3>
                <p className="text-xl text-muted-foreground">{profileData.title}</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 text-sm flex-wrap">
                <div className="flex items-center justify-center md:justify-start gap-1 bg-muted/50 px-3 py-1.5 rounded-full">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{profileData.location}</span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-1 bg-muted/50 px-3 py-1.5 rounded-full">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span>{profileData.education}</span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-1 bg-muted/50 px-3 py-1.5 rounded-full">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  <a href={profileData.website} className="hover:underline text-primary">
                    {profileData.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 rounded-lg p-6 text-center transform transition-all hover:scale-105 hover:shadow-lg">
              <div className="flex justify-center mb-2">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Code className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h4 className="text-2xl font-bold gradient-text">{profileData.stats.websites}</h4>
              <p className="text-muted-foreground">Websites Monitored</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-6 text-center transform transition-all hover:scale-105 hover:shadow-lg">
              <div className="flex justify-center mb-2">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Award className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h4 className="text-2xl font-bold gradient-text">{profileData.stats.uptime}</h4>
              <p className="text-muted-foreground">Average Uptime</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-6 text-center transform transition-all hover:scale-105 hover:shadow-lg">
              <div className="flex justify-center mb-2">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Coffee className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h4 className="text-2xl font-bold gradient-text">{profileData.stats.experience}</h4>
              <p className="text-muted-foreground">Development Experience</p>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 relative">
            <div className="absolute -top-3 left-4 bg-primary text-white rounded-full p-1">
              <User className="h-4 w-4" />
            </div>
            <p className="italic text-lg">{profileData.bio}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {profileData.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-primary/10 hover:bg-primary/20 transition-colors">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-blue-400/10 rounded-lg p-6 text-center">
            <Briefcase className="h-6 w-6 text-primary mx-auto mb-2" />
            <h4 className="text-xl font-bold mb-2">Looking for a monitoring solution?</h4>
            <p className="text-muted-foreground mb-4">
              I built WebTether to solve real-world monitoring challenges. Let's connect!
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted/50 hover:bg-muted transition-colors px-4 py-2 rounded-md"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted/50 hover:bg-muted transition-colors px-4 py-2 rounded-md"
              >
                LinkedIn
              </a>
              <a
                href="mailto:contact@example.com"
                className="bg-muted/50 hover:bg-muted transition-colors px-4 py-2 rounded-md"
              >
                Email
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

