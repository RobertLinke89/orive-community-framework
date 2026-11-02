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

interface FacilitatorNotificationEmailProps {
  facilitatorName: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  sessionTitle: string
  sessionType: 'session' | 'experience'
  bookingDate: string
  bookingTime: string
  duration: number
  notes?: string
  dashboardLink: string
}

export const FacilitatorNotificationEmail = ({
  facilitatorName,
  clientName,
  clientEmail,
  clientPhone,
  sessionTitle,
  sessionType,
  bookingDate,
  bookingTime,
  duration,
  notes,
  dashboardLink,
}: FacilitatorNotificationEmailProps) => {
  const sessionLabel = sessionType === 'session' ? '1:1 Session' : 'Group Experience'
  
  return (
    <Html>
      <Head />
      <Preview>New booking request for {sessionTitle} from {clientName}</Preview>
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
            <Text style={badge}>🔔 New Booking Request</Text>
            
            <Heading style={h1}>Hi {facilitatorName}!</Heading>
            
            <Text style={text}>
              You have a new booking request from <strong>{clientName}</strong>.
            </Text>

            {/* Booking details card */}
            <Section style={detailsCard}>
              <Text style={cardTitle}>{sessionTitle}</Text>
              <Text style={sessionTypeLabel}>{sessionLabel}</Text>
              
              <Hr style={cardDivider} />
              
              <table style={detailsTable}>
                <tr>
                  <td style={detailLabel}>📅 Date:</td>
                  <td style={detailValue}>{bookingDate}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>🕐 Time:</td>
                  <td style={detailValue}>{bookingTime}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>⏱ Duration:</td>
                  <td style={detailValue}>{duration} minutes</td>
                </tr>
              </table>
            </Section>

            {/* Client details card */}
            <Section style={clientCard}>
              <Text style={clientCardTitle}>Client Details</Text>
              
              <table style={detailsTable}>
                <tr>
                  <td style={detailLabel}>👤 Name:</td>
                  <td style={detailValue}>{clientName}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>✉️ Email:</td>
                  <td style={detailValueLink}>
                    <Link href={`mailto:${clientEmail}`} style={emailLink}>{clientEmail}</Link>
                  </td>
                </tr>
                {clientPhone && (
                  <tr>
                    <td style={detailLabel}>📞 Phone:</td>
                    <td style={detailValue}>{clientPhone}</td>
                  </tr>
                )}
              </table>

              {notes && (
                <>
                  <Hr style={cardDivider} />
                  <Text style={notesLabel}>💬 Message from client:</Text>
                  <Text style={notesText}>"{notes}"</Text>
                </>
              )}
            </Section>

            {/* CTA Buttons */}
            <Section style={buttonSection}>
              <Link href={dashboardLink} style={primaryButton}>
                View in Dashboard
              </Link>
            </Section>

            <Section style={buttonSection}>
              <Link href={`mailto:${clientEmail}?subject=Re: Your booking request for ${sessionTitle}`} style={secondaryButton}>
                Reply to {clientName}
              </Link>
            </Section>

            <Text style={helpText}>
              Please confirm or reschedule this booking through your ORIVE dashboard.
            </Text>

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

export default FacilitatorNotificationEmail

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
  backgroundColor: '#00CDAC',
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

const detailsCard = {
  backgroundColor: '#0d3d4a',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '16px',
}

const cardTitle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const sessionTypeLabel = {
  color: '#00CDAC',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0 0 16px',
}

const cardDivider = {
  borderColor: 'rgba(255, 255, 255, 0.1)',
  margin: '16px 0',
}

const clientCard = {
  backgroundColor: '#162447',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid rgba(0, 205, 172, 0.2)',
}

const clientCardTitle = {
  color: '#00CDAC',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0 0 16px',
}

const detailsTable = {
  width: '100%',
  borderSpacing: '0',
}

const detailLabel = {
  color: '#a0aec0',
  fontSize: '14px',
  padding: '6px 0',
  width: '30%',
  verticalAlign: 'top' as const,
}

const detailValue = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  textAlign: 'right' as const,
  padding: '6px 0',
  verticalAlign: 'top' as const,
}

const detailValueLink = {
  textAlign: 'right' as const,
  padding: '6px 0',
  verticalAlign: 'top' as const,
}

const emailLink = {
  color: '#00CDAC',
  fontSize: '14px',
  textDecoration: 'underline',
}

const notesLabel = {
  color: '#a0aec0',
  fontSize: '12px',
  margin: '0 0 8px',
}

const notesText = {
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

const primaryButton = {
  backgroundColor: '#FFA500',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 40px',
  borderRadius: '8px',
  display: 'inline-block',
}

const secondaryButton = {
  backgroundColor: 'transparent',
  color: '#00CDAC',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '12px 32px',
  borderRadius: '8px',
  display: 'inline-block',
  border: '1px solid #00CDAC',
}

const helpText = {
  color: '#a0aec0',
  fontSize: '13px',
  textAlign: 'center' as const,
  margin: '16px 0 0',
}

const divider = {
  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderStyle: 'dashed' as const,
  margin: '32px 0 24px',
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