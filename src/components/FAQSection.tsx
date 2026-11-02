import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "How do you help me align my business with my purpose?",
      answer: "We start with a deep dive into your personal mission and values. Through our Purpose Alignment process, we help you clearly define your 'why' and ensure every business decision reflects your core beliefs. This includes developing your mission statement, identifying your ideal impact, and creating systems that keep you true to your purpose as you scale."
    },
    {
      question: "What makes a business 'purpose-driven' vs. just profitable?",
      answer: "A purpose-driven business measures success beyond financial metrics. While profitability is essential for sustainability, these businesses prioritize positive impact, authentic relationships, and meaningful change. We help you build a business model where profit and purpose work together, creating sustainable growth that benefits all stakeholders."
    },
    {
      question: "How long does it take to launch a purpose-driven business?",
      answer: "Timeline varies based on your industry and goals, but typically 3-9 months for a solid foundation. We focus on sustainable launch strategies rather than rushing to market. This includes proper legal setup, brand development, market validation, and building the right systems from the start to support long-term growth."
    },
    {
      question: "Do you work with businesses already established or just startups?",
      answer: "We work with both! Many established businesses seek to realign with their founder's original purpose or pivot toward more meaningful work. Whether you're starting from scratch or transforming an existing business, we tailor our approach to your current situation and goals."
    },
    {
      question: "How do you measure the 'impact' of a purpose-driven business?",
      answer: "We develop custom impact metrics based on your specific mission. This might include social impact indicators, environmental metrics, community engagement levels, customer transformation stories, or employee fulfillment measures. We create dashboards that track both traditional business KPIs and purpose-specific outcomes."
    },
    {
      question: "What if I'm not sure what my exact purpose is yet?",
      answer: "That's exactly where we start! Our Purpose Discovery process helps clarify your unique mission through structured exercises, reflection sessions, and market exploration. Many successful purpose-driven leaders began with just a feeling that they wanted to make a difference - we help turn that feeling into a clear, actionable mission."
    },
    {
      question: "How do you ensure the business remains financially viable?",
      answer: "Purpose and profit aren't mutually exclusive - they're synergistic. We help you develop business models where doing good drives financial success. This includes identifying revenue streams aligned with your mission, building loyal customer bases through authentic value, and creating sustainable pricing strategies."
    },
    {
      question: "What kind of support do you provide after launch?",
      answer: "Our relationship continues beyond launch with ongoing strategic support, quarterly business reviews, access to our purpose-driven entrepreneur community, and guidance through growth challenges. We're invested in your long-term success and the lasting impact you create."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-card">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-raleway font-bold text-foreground mb-6">
            Frequently Asked <span className="text-highlight-gradient">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get answers to common questions about building and growing a purpose-driven business.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 bg-background"
              >
                <AccordionTrigger className="text-left font-raleway font-medium text-foreground hover:text-highlight transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}