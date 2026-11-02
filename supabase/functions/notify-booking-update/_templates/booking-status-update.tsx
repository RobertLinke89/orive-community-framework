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

interface BookingStatusUpdateEmailProps {
  customerName: string
  sessionTitle: string
  sessionType: 'session' | 'experience'
  facilitatorName: string
  status: 'confirmed' | 'rescheduled' | 'cancelled'
  bookingDate: string
  bookingTime: string
  duration: number
  oldDate?: string
  oldTime?: string
  calendarLink?: string
  message?: string
}

export const BookingStatusUpdateEmail = ({
  customerName,
  sessionTitle,
  sessionType,
  facilitatorName,
  status,
  bookingDate,
  bookingTime,
  duration,
  oldDate,
  oldTime,
  calendarLink,
  message,
}: BookingStatusUpdateEmailProps) => {
  const sessionLabel = sessionType === 'session' ? '1:1 Session' : 'Group Experience'
  
  const statusConfig = {
    confirmed: {
      emoji: '✅',
      title: 'Booking Confirmed!',
      subtitle: `Great news! ${facilitatorName} has confirmed your session.`,
      color: '#00CDAC',
    },
    rescheduled: {
      emoji: '📅',
      title: 'Booking Rescheduled',
      subtitle: `${facilitatorName} has rescheduled your session to a new time.`,
      color: '#FFA500',
    },
    cancelled: {
      emoji: '❌',
      title: 'Booking Cancelled',
      subtitle: `Unfortunately, your session with ${facilitatorName} has been cancelled.`,
      color: '#ef4444',
    },
  }

  const config = statusConfig[status]
  
  return (
    <Html>
      <Head />
      <Preview>{config.title} - {sessionTitle}</Preview>
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
            <Text style={{ ...badge, backgroundColor: config.color }}>
              {config.emoji} {config.title}
            </Text>
            
            <Heading style={h1}>Hi {customerName}!</Heading>
            
            <Text style={text}>{config.subtitle}</Text>

            {/* Show old vs new for rescheduled */}
            {status === 'rescheduled' && oldDate && oldTime && (
              <Section style={changeCard}>
                <table style={changeTable}>
                  <tr>
                    <td style={changeColumn}>
                      <Text style={changeLabel}>Previous</Text>
                      <Text style={oldValueText}>{oldDate}</Text>
                      <Text style={oldValueText}>{oldTime}</Text>
                    </td>
                    <td style={arrowColumn}>
                      <Text style={arrowText}>→</Text>
                    </td>
                    <td style={changeColumn}>
                      <Text style={changeLabel}>New</Text>
                      <Text style={newValueText}>{bookingDate}</Text>
                      <Text style={newValueText}>{bookingTime}</Text>
                    </td>
                  </tr>
                </table>
              </Section>
            )}

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
                <tr>
                  <td style={detailLabel}>Status:</td>
                  <td style={{ ...statusValue, color: config.color }}>
                    {status === 'confirmed' && '✓ Confirmed'}
                    {status === 'rescheduled' && '📅 Rescheduled'}
                    {status === 'cancelled' && '✕ Cancelled'}
                  </td>
                </tr>
              </table>
            </Section>

            {/* Optional message from facilitator */}
            {message && (
              <Section style={messageCard}>
                <Text style={messageLabel}>Message from {facilitatorName}:</Text>
                <Text style={messageText}>"{message}"</Text>
              </Section>
            )}

            {/* Calendar Button for confirmed/rescheduled */}
            {status !== 'cancelled' && calendarLink && (
              <Section style={buttonSection}>
                <Link href={calendarLink} style={calendarButton}>
                  📅 Update Calendar
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
              <Text style={footerText}>Aho,</Text>
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

export default BookingStatusUpdateEmail

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
  padding: '40px 30px',
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
  fontSize: '36px',
  fontWeight: '300',
  letterSpacing: '10px',
  margin: '0',
}

const content = {
  padding: '32px 30px',
  backgroundColor: '#0a1628',
}

const badge = {
  color: '#0a1628',
  fontSize: '12px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  padding: '6px 12px',
  borderRadius: '4px',
  display: 'inline-block',
  margin: '0 0 16px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const text = {
  color: '#ffffff',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
}

const changeCard = {
  backgroundColor: '#162447',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
  border: '1px solid rgba(255, 165, 0, 0.3)',
}

const changeTable = {
  width: '100%',
}

const changeColumn = {
  width: '45%',
  verticalAlign: 'top' as const,
}

const arrowColumn = {
  width: '10%',
  textAlign: 'center' as const,
  verticalAlign: 'middle' as const,
}

const changeLabel = {
  color: '#a0aec0',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}

const oldValueText = {
  color: '#ef4444',
  fontSize: '14px',
  textDecoration: 'line-through' as const,
  margin: '2px 0',
}

const newValueText = {
  color: '#00CDAC',
  fontSize: '14px',
  fontWeight: '600',
  margin: '2px 0',
}

const arrowText = {
  color: '#FFA500',
  fontSize: '24px',
  margin: '0',
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

const statusValue = {
  fontSize: '14px',
  fontWeight: '600',
  textAlign: 'right' as const,
  padding: '8px 0',
}

const messageCard = {
  backgroundColor: '#162447',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid rgba(0, 205, 172, 0.2)',
}

const messageLabel = {
  color: '#a0aec0',
  fontSize: '12px',
  margin: '0 0 8px',
}

const messageText = {
  color: '#ffffff',
  fontSize: '14px',
  fontStyle: 'italic' as const,
  margin: '0',
  lineHeight: '22px',
}

const buttonSection = {
  textAlign: 'center' as const,
  marginBottom: '12px',
}

const button = {
  backgroundColor: '#FFA500',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 40px',
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