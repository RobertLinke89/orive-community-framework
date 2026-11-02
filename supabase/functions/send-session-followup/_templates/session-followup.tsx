import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'https://esm.sh/@react-email/components@0.0.22'
import * as React from 'https://esm.sh/react@18.3.1'

interface SessionFollowupEmailProps {
  customerName: string
  sessionTitle: string
  sessionType: 'session' | 'experience'
  facilitatorName: string
  feedbackLink?: string
}

export const SessionFollowupEmail = ({
  customerName,
  sessionTitle,
  sessionType,
  facilitatorName,
  feedbackLink,
}: SessionFollowupEmailProps) => {
  const sessionLabel = sessionType === 'session' ? '1:1 session' : 'group experience'
  
  return (
    <Html>
      <Head />
      <Preview>
        How was your {sessionLabel} with {facilitatorName}? We'd love your feedback!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <table style={headerTable}>
              <tr>
                <td style={headerCell}>
                  <Text style={logoText}>ORIVE</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={h1}>Hi {customerName}! 🙏</Heading>
            
            <Text style={text}>
              We hope your {sessionLabel} with <strong>{facilitatorName}</strong> was transformative!
            </Text>

            <Text style={text}>
              Your experience with "{sessionTitle}" matters deeply to us. Would you take a moment to share your thoughts?
            </Text>

            {/* Feedback Card */}
            <Section style={feedbackCard}>
              <Text style={feedbackTitle}>📝 Share Your Experience</Text>
              <Text style={feedbackText}>
                Your feedback helps {facilitatorName} grow and helps others discover their perfect wellness journey.
              </Text>
              {feedbackLink && (
                <Link href={feedbackLink} style={feedbackButton}>
                  Leave Feedback
                </Link>
              )}
            </Section>

            {/* WhatsApp Support Promotion */}
            <Section style={whatsappCard}>
              <Text style={whatsappIcon}>💬</Text>
              <Text style={whatsappTitle}>24/7 Integration Support</Text>
              <Text style={whatsappText}>
                Need to process your experience? Our WhatsApp integration support is here for you around the clock. 
                Get personalized guidance, ask questions, or simply share how you're feeling.
              </Text>
              <Text style={whatsappFeatures}>
                ✓ Instant responses any time<br />
                ✓ Personalized wellness tips<br />
                ✓ Integration exercises & practices<br />
                ✓ Direct connection with your facilitator
              </Text>
              <Link href="https://wa.me/message/ORIVE" style={whatsappButton}>
                💬 Start WhatsApp Chat
              </Link>
            </Section>

            {/* Wellness Tips */}
            <Section style={tipsCard}>
              <Text style={tipsTitle}>🌿 Post-Session Integration Tips</Text>
              <table style={tipsTable}>
                <tr>
                  <td style={tipIcon}>💧</td>
                  <td style={tipText}>Stay hydrated - drink plenty of water</td>
                </tr>
                <tr>
                  <td style={tipIcon}>📓</td>
                  <td style={tipText}>Journal your insights while fresh</td>
                </tr>
                <tr>
                  <td style={tipIcon}>🧘</td>
                  <td style={tipText}>Allow time for rest and reflection</td>
                </tr>
                <tr>
                  <td style={tipIcon}>🌙</td>
                  <td style={tipText}>Prioritize quality sleep tonight</td>
                </tr>
              </table>
            </Section>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Link href="https://orive.app" style={button}>
                Explore More Sessions
              </Link>
            </Section>

            {/* Divider */}
            <Hr style={divider} />

            {/* Footer */}
            <Section style={footer}>
              <Text style={footerText}>With gratitude,</Text>
              <Text style={footerText}>Your ORIVE Core Team.</Text>
              
              <table style={socialTable}>
                <tr>
                  <td style={socialCell}>
                    <Link href="https://facebook.com" style={socialLink}>f</Link>
                  </td>
                  <td style={socialCell}>
                    <Link href="https://twitter.com" style={socialLink}>𝕏</Link>
                  </td>
                  <td style={socialCell}>
                    <Link href="https://linkedin.com" style={socialLink}>in</Link>
                  </td>
                </tr>
              </table>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default SessionFollowupEmail

// Styles
const main = {
  backgroundColor: '#0a1628',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  width: '100%',
  maxWidth: '600px',
}

const header = {
  background: 'linear-gradient(135deg, #0a1628 0%, #0d3d4a 100%)',
  padding: '60px 30px',
  textAlign: 'center' as const,
  borderBottom: '1px solid rgba(0, 205, 172, 0.2)',
}

const headerTable = {
  width: '100%',
}

const headerCell = {
  textAlign: 'center' as const,
}

const logoText = {
  color: '#00CDAC',
  fontSize: '48px',
  fontWeight: '300',
  letterSpacing: '12px',
  margin: '0',
}

const content = {
  padding: '40px 30px',
  backgroundColor: '#0a1628',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const text = {
  color: '#ffffff',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
}

const feedbackCard = {
  backgroundColor: '#0d3d4a',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const feedbackTitle = {
  color: '#00CDAC',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const feedbackText = {
  color: '#a0aec0',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 20px',
}

const feedbackButton = {
  backgroundColor: '#00CDAC',
  color: '#0a1628',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '12px 32px',
  borderRadius: '8px',
  display: 'inline-block',
}

const whatsappCard = {
  background: 'linear-gradient(135deg, #075e54 0%, #128c7e 100%)',
  borderRadius: '12px',
  padding: '28px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const whatsappIcon = {
  fontSize: '40px',
  margin: '0 0 8px',
}

const whatsappTitle = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 12px',
}

const whatsappText = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
}

const whatsappFeatures = {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: '13px',
  lineHeight: '24px',
  margin: '0 0 20px',
  textAlign: 'left' as const,
}

const whatsappButton = {
  backgroundColor: '#25D366',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 36px',
  borderRadius: '30px',
  display: 'inline-block',
}

const tipsCard = {
  backgroundColor: 'rgba(0, 205, 172, 0.1)',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  borderLeft: '4px solid #00CDAC',
}

const tipsTitle = {
  color: '#00CDAC',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const tipsTable = {
  width: '100%',
  borderSpacing: '0',
}

const tipIcon = {
  width: '30px',
  fontSize: '16px',
  padding: '6px 0',
  verticalAlign: 'top' as const,
}

const tipText = {
  color: '#ffffff',
  fontSize: '14px',
  padding: '6px 0',
  verticalAlign: 'top' as const,
}

const buttonSection = {
  textAlign: 'center' as const,
  marginBottom: '16px',
}

const button = {
  backgroundColor: '#FFA500',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 48px',
  borderRadius: '8px',
  display: 'inline-block',
}

const divider = {
  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderStyle: 'dashed' as const,
  margin: '24px 0',
}

const footer = {
  textAlign: 'center' as const,
  paddingTop: '16px',
}

const footerText = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '2px 0',
}

const socialTable = {
  margin: '24px auto 0',
  borderSpacing: '12px',
}

const socialCell = {
  padding: '0',
}

const socialLink = {
  display: 'inline-block',
  width: '36px',
  height: '36px',
  lineHeight: '36px',
  textAlign: 'center' as const,
  color: 'rgba(255, 255, 255, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '50%',
  textDecoration: 'none',
  fontSize: '14px',
}