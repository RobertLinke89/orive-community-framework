"use client";
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Globe, Shield, FileCheck } from "lucide-react"

const oriveLogo = "/orive-logo-formation-disc.png"

interface BusinessNameLoaderProps {
  businessName: string
  onComplete: () => void
}

const verificationSteps = [
  { icon: Globe, label: "Connecting to EU registries", progress: 30 },
  { icon: Search, label: "Verifying name availability", progress: 60 },
  { icon: Shield, label: "Checking trademark databases", progress: 85 },
  { icon: FileCheck, label: "Finalizing verification", progress: 100 },
]

export const BusinessNameLoader = ({ businessName, onComplete }: BusinessNameLoaderProps) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(timer)
  }, [onComplete])

  const currentStep = verificationSteps.find((step, index) => {
    const nextStep = verificationSteps[index + 1]
    return progress < (nextStep?.progress ?? 101)
  }) || verificationSteps[verificationSteps.length - 1]

  const CurrentIcon = currentStep.icon

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 px-6">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-highlight/5 via-transparent to-highlight/3 pointer-events-none" />
      
      <div className="relative z-10 text-center space-y-10 max-w-md w-full">
        {/* Animated Circle Container */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          {/* Outer ring - subtle pulse */}
          <motion.div
            className="absolute inset-0 border-2 border-highlight/20 rounded-full"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="90"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="4"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="90"
              fill="none"
              stroke="hsl(var(--highlight))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={565}
              strokeDashoffset={565 - (565 * progress) / 100}
              initial={{ strokeDashoffset: 565 }}
              animate={{ strokeDashoffset: 565 - (565 * progress) / 100 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </svg>

          <motion.div
            className="absolute inset-[10px] rounded-full overflow-hidden"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src={oriveLogo}
              alt="Orive"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        <span className="block text-2xl font-semibold text-foreground -mt-4">{progress}%</span>

        {/* Business name being checked */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
            Checking availability for
          </p>
          <p className="text-xl font-semibold text-foreground">{businessName}</p>
        </div>

        {/* Current step indicator */}
        <motion.div
          key={currentStep.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-center gap-3 text-muted-foreground"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <CurrentIcon className="w-5 h-5 text-highlight" />
          </motion.div>
          <span className="text-sm font-medium">{currentStep.label}</span>
        </motion.div>

        {/* Step progress dots */}
        <div className="flex items-center justify-center gap-2">
          {verificationSteps.map((step, index) => {
            const isCompleted = progress >= step.progress
            const isActive = currentStep === step
            return (
              <motion.div
                key={step.label}
                className={`w-2 h-2 rounded-full transition-colors ${
                  isCompleted 
                    ? "bg-highlight" 
                    : isActive 
                      ? "bg-highlight/50" 
                      : "bg-border"
                }`}
                animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
