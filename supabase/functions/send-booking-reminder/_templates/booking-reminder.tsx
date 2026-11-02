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

interface BookingReminderEmailProps {
  customerName: string
  sessionTitle: string
  sessionType: 'session' | 'experience'
  bookingDate: string
  bookingTime: string
  duration: number
  facilitatorName: string
  calendarLink?: string
}

export const BookingReminderEmail = ({
  customerName,
  sessionTitle,
  sessionType,
  bookingDate,
  bookingTime,
  duration,
  facilitatorName,
  calendarLink,
}: BookingReminderEmailProps) => {
  const sessionLabel = sessionType === 'session' ? '1:1 Session' : 'Group Experience'
  
  return (
    <Html>
      <Head />
      <Preview>
        Reminder: Your session "{sessionTitle}" is tomorrow!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with network background */}
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
            <Text style={reminderBadge}>⏰ 24-HOUR REMINDER</Text>
            
            <Heading style={h1}>Hi {customerName}!</Heading>
            
            <Text style={text}>
              This is a friendly reminder that your session is coming up <strong>tomorrow</strong>!
            </Text>

            {/* Booking details card */}
            <Section style={detailsCard}>
              <table style={detailsTable}>
                <tr>
                  <td style={detailLabel}>{sessionLabel}:</td>
                  <td style={detailValue}>{sessionTitle}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>Date:</td>
                  <td style={detailValue}>{bookingDate}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>Time:</td>
                  <td style={detailValue}>{bookingTime}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>Duration:</td>
                  <td style={detailValue}>{duration} minutes</td>
                </tr>
                <tr>
                  <td style={detailLabel}>Facilitator:</td>
                  <td style={detailValue}>{facilitatorName}</td>
                </tr>
              </table>
            </Section>

            <Text style={tipText}>
              💡 <strong>Tip:</strong> Prepare a quiet space, have water nearby, and arrive a few minutes early to settle in.
            </Text>

            {/* Calendar Button */}
            {calendarLink && (
              <Section style={buttonSection}>
                <Link href={calendarLink} style={calendarButton}>
                  📅 Add to Calendar
                </Link>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Link href="https://orive.app" style={button}>
                View on ORIVE
              </Link>
            </Section>

            {/* Divider */}
            <Hr style={divider} />

            {/* Footer */}
            <Section style={footer}>
              <Text style={footerText}>See you soon!</Text>
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

export default BookingReminderEmail

// Styles matching the Orive design system
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

const reminderBadge = {
  backgroundColor: '#FFA500',
  color: '#0a1628',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '1px',
  padding: '8px 16px',
  borderRadius: '20px',
  display: 'inline-block',
  marginBottom: '20px',
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
  lineHeight: '24px',
  margin: '0 0 24px',
}

const tipText = {
  color: '#a0aec0',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 24px',
  backgroundColor: 'rgba(0, 205, 172, 0.1)',
  padding: '16px',
  borderRadius: '8px',
  borderLeft: '4px solid #00CDAC',
}

const detailsCard = {
  backgroundColor: '#0d3d4a',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
}

const detailsTable = {
  width: '100%',
  borderSpacing: '0',
}

const detailLabel = {
  color: '#a0aec0',
  fontSize: '14px',
  padding: '8px 0',
  width: '35%',
  verticalAlign: 'top' as const,
}

const detailValue = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textAlign: 'right' as const,
  padding: '8px 0',
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

const calendarButton = {
  backgroundColor: '#00CDAC',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '12px 32px',
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