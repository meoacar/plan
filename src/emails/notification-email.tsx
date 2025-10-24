import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NotificationEmailProps {
  userName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export function NotificationEmail({
  userName,
  title,
  message,
  actionUrl,
  actionText = 'Görüntüle',
}: NotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Zayıflama Planım</Heading>
          <Text style={greeting}>Merhaba {userName},</Text>
          <Section style={notificationBox}>
            <Heading as="h2" style={h2}>
              {title}
            </Heading>
            <Text style={messageText}>{message}</Text>
          </Section>
          {actionUrl && (
            <Section style={buttonContainer}>
              <Button style={button} href={actionUrl}>
                {actionText}
              </Button>
            </Section>
          )}
          <Text style={footer}>
            Bu bildirimi almak istemiyorsanız, bildirim tercihlerinizi{' '}
            <a href={`${process.env.NEXTAUTH_URL}/ayarlar/bildirimler`}>buradan</a>{' '}
            değiştirebilirsiniz.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 15px',
};

const greeting = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
  padding: '0 40px',
};

const notificationBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '0 40px 24px',
};

const messageText = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#4caf50',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '24px 40px 0',
  textAlign: 'center' as const,
};

export default NotificationEmail;
