import {
  Card,
  CardHeader,
  CardPreview,
  Spinner,
  Text,
  makeStyles,
} from '@fluentui/react-components';
import { app } from '@microsoft/teams-js';
import { useEffect, useState } from 'react';
import Tab from './Tab';

const useStyles = makeStyles({
  disclaimerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    textAlign: 'center',
  },
  disclaimerCard: {
    maxWidth: '500px',
    padding: '24px',
  },
});

function ChatContextRequired() {
  const styles = useStyles();

  return (
    <div className={styles.disclaimerContainer}>
      <Card className={styles.disclaimerCard}>
        <CardHeader header={<Text size={600}>💬 Chat Context Required</Text>} />
        <CardPreview>
          <div style={{ padding: '16px 0' }}>
            <Text size={300} style={{ display: 'block', marginBottom: '16px' }}>
              Image Gallery only works in Teams chats to access shared images.
            </Text>
            <Text
              size={300}
              style={{
                display: 'block',
                textAlign: 'left',
                marginBottom: '16px',
              }}
            >
              Please use this app in:
            </Text>
            <ul style={{ textAlign: 'left', marginBottom: '16px' }}>
              <li>✅ Teams one-on-one chats</li>
              <li>✅ Teams group chats</li>
            </ul>

            <Text size={300} style={{ fontWeight: 'bold' }}>
              To use: Add this app as a tab to a Teams chat conversation.
            </Text>
          </div>
        </CardPreview>
      </Card>
    </div>
  );
}

export default function ChatContextValidator() {
  const [isInChat, setIsInChat] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we're in a chat context
    app
      .getContext()
      .then((context) => {
        // Check if we have a chat ID, which indicates we're in a chat
        setIsInChat(!!context.chat?.id);
      })
      .catch(() => {
        // If we can't get context or there's an error, assume not in chat
        setIsInChat(false);
      });
  }, []);

  // Show loading while checking chat context
  if (isInChat === null) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spinner label='Checking chat context...' />
      </div>
    );
  }

  // Show disclaimer if not in a chat
  if (!isInChat) {
    return <ChatContextRequired />;
  }

  // Render Tab component when in chat context
  return <Tab />;
}
