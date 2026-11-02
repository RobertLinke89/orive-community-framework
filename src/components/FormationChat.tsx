"use client";
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, CheckCircle2, ArrowRight } from "lucide-react"
const oriveLogo = "/orive-chat-avatar.png";
import { z } from "zod"
import { toast } from "sonner"

// Validation schemas for different input types
const textInputSchema = z.string()
  .trim()
  .min(1, "This field cannot be empty")
  .max(500, "Response must be less than 500 characters");

const addressSchema = z.string()
  .trim()
  .min(5, "Address must be at least 5 characters")
  .max(200, "Address must be less than 200 characters");

const capitalSchema = z.string()
  .trim()
  .regex(/^€?\s?\d{1,3}(,?\d{3})*(\.\d{2})?$/, "Please enter a valid capital amount (e.g., €25,000 or 25000)");

const nameSchema = z.string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-ZäöüßÄÖÜ\s\-'.]+$/, "Name contains invalid characters");

interface Message {
  id: string
  text: string
  sender: "user" | "agent"
  timestamp: Date
}

interface FormationChatProps {
  businessName: string
  country: string
  onUpdateDocuments: (doc: any) => void
  onStepChange: (step: number) => void
}

const countryQuestions = {
  eu: [
    "I will assist you in establishing your EU Inc. under the European 28th Regime (Directives (EU) 2019/1151 & Directive (EU) 2025/25). First, what is the official business activity and European commercial focus?",
    "What will be the primary registered business address and digital communication seat in the EU?",
    "Please provide the full name, nationality, and official email of the Managing Director (to receive the eIDAS 2.0 digital signature invite).",
    "What is the intended digital share capital contribution? (Minimum €1 up to standard €25,000, deposited via digital SEPA account).",
    "Please declare the Ultimate Beneficial Owners (UBOs) holding 25%+ equity or voting rights for the EU Transparency Register.",
    "Do you confirm adoption of the standard European Model Articles of Association and grant Digital EU Power of Attorney for cross-border BRIS filing? (Yes / Custom)",
  ],
  germany: [
    "Let me help you register your business in Germany. First, what type of legal entity would you like to establish? (GmbH, UG, AG, etc.)",
    "What will be the registered office address of your company?",
    "Who will be the managing director(s)? Please provide full name and address.",
    "What is the share capital amount? (Minimum €25,000 for GmbH)",
    "Please describe your business purpose and activities.",
    "Who are the shareholders and what are their shareholding percentages?",
  ],
  austria: [
    "I'll guide you through the Austrian company formation. What type of company structure do you prefer? (GmbH, AG, OG, etc.)",
    "What is the business address in Austria?",
    "Please provide details of the managing director(s).",
    "What is the initial share capital? (Minimum €35,000 for GmbH)",
    "Describe your business activities and purpose.",
    "List all shareholders and their respective shares.",
  ],
}

export function FormationChat({ businessName, country, onUpdateDocuments, onStepChange }: FormationChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Welcome! I'm here to help you establish ${businessName || "your company"}. This is an official government-compliant digital formation process. Let's begin by gathering the necessary information.`,
      sender: "agent",
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const questions = countryQuestions[country as keyof typeof countryQuestions] || countryQuestions.eu;

  useEffect(() => {
    // Start with first question
    setTimeout(() => {
      addAgentMessage(questions[0])
    }, 1000)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addAgentMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      sender: "agent",
      timestamp: new Date()
    }])
  }

  const validateInput = (input: string, questionIndex: number): boolean => {
    try {
      // Apply different validation based on question type
      if (questionIndex === 1) {
        // Address validation
        addressSchema.parse(input);
      } else if (questionIndex === 2) {
        // Managing director name validation
        nameSchema.parse(input);
      } else if (questionIndex === 3) {
        // Capital amount validation
        capitalSchema.parse(input);
      } else {
        // General text validation
        textInputSchema.parse(input);
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    // Validate input before proceeding
    if (!validateInput(inputText, currentQuestion)) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Store form data
    const questionKey = `question_${currentQuestion}`
    setFormData(prev => ({ ...prev, [questionKey]: inputText }))

    // Generate document update
    onUpdateDocuments({
      field: questionKey,
      value: inputText,
      timestamp: new Date()
    })

    setInputText("")

    // Move to next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        const nextQ = currentQuestion + 1
        setCurrentQuestion(nextQ)
        onStepChange(nextQ)
        addAgentMessage(questions[nextQ])
      } else {
        setCurrentQuestion(questions.length)
        onStepChange(questions.length)
        addAgentMessage("All required formation data has been validated against EU Directives 2019/1151 & 2025/25. Your draft documents are ready. You can now proceed to finalize your digital formation via Stripe checkout.")
      }
    }, 800)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Progress Bar */}
      <div className="border-b bg-card px-6 py-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Formation Questionnaire: {Math.min(currentQuestion, questions.length)} of {questions.length}</span>
          <span className="text-xs font-semibold text-highlight">
            {currentQuestion >= questions.length ? "100% Complete" : `${Math.round((currentQuestion / questions.length) * 100)}%`}
          </span>
        </div>
        <div className="w-full bg-secondary/30 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#16B1C3] to-[#00CDAC] h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, (currentQuestion / questions.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-4 max-w-3xl">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "agent" && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={oriveLogo} alt="ORIVE" />
                  <AvatarFallback>OR</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              {message.sender === "user" && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-r from-[#16B1C3] to-[#00CDAC] text-gray-900 dark:text-white text-xs font-semibold">
                    ME
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input / Completion Actions */}
      <div className="border-t bg-card px-6 py-4">
        {currentQuestion >= questions.length ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-highlight/10 border border-highlight/30">
            <div>
              <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-highlight" />
                Information Gathering Complete
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ready for eIDAS 2.0 digital verification, BRIS registration & EUCC issuance.
              </p>
            </div>
            <Button
              onClick={() => router.push(`/formation/checkout?name=${encodeURIComponent(businessName)}&country=${encodeURIComponent(country)}&tier=professional`)}
              className="w-full sm:w-auto bg-highlight hover:bg-highlight/90 text-highlight-foreground font-semibold shadow-md gap-2"
            >
              Proceed to Stripe Checkout
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!inputText.trim()}
              className="bg-highlight hover:bg-highlight/90 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
