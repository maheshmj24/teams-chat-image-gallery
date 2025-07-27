import {
  Button,
  Card,
  CardHeader,
  CardPreview,
  makeStyles,
  Spinner,
  Text,
} from '@fluentui/react-components';
import { app } from '@microsoft/teams-js';
import { useEffect, useState } from 'react';
import ChatContextValidator from './ChatContextValidator';

const useStyles = makeStyles({
  notInTeamsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    textAlign: 'center',
  },
  notInTeamsCard: {
    maxWidth: '500px',
    padding: '24px',
  },
});

function NotInTeamsMessage() {
  const styles = useStyles();

  return (
    <div className={styles.notInTeamsContainer}>
      <Card className={styles.notInTeamsCard}>
        <CardHeader
          header={<Text size={600}>⚠️ Teams Context Required</Text>}
        />
        <CardPreview>
          <div style={{ padding: '16px 0' }}>
            <Text size={400} style={{ display: 'block', marginBottom: '16px' }}>
              Image Gallery is designed to work within Microsoft Teams. Please
              access this app through:
            </Text>
            <ul style={{ textAlign: 'left', marginBottom: '16px' }}>
              <li>Teams desktop application</li>
              <li>Teams web application</li>
              <li>Teams mobile application</li>
            </ul>
            <Text size={300} style={{ fontStyle: 'italic' }}>
              The app needs Teams context to access your chat images and provide
              authentication.
            </Text>
          </div>
        </CardPreview>
        <Button
          appearance='primary'
          onClick={() => window.open('https://teams.microsoft.com', '_blank')}
        >
          Open Microsoft Teams
        </Button>
      </Card>
    </div>
  );
}

export default function TeamsContextValidator() {
  const [isInTeams, setIsInTeams] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we're running in Teams context
    app
      .initialize()
      .then(() => {
        app
          .getContext()
          .then((context: any) => {
            // If we can get Teams context, we're in Teams
            setIsInTeams(!!context);
          })
          .catch(() => {
            // If getting context fails, we're not in Teams
            setIsInTeams(false);
          });
      })
      .catch(() => {
        // If Teams initialization fails, we're not in Teams
        setIsInTeams(false);
      });
  }, []);

  // Show loading while checking Teams context
  if (isInTeams === null) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spinner label='Checking Teams context...' />
      </div>
    );
  }

  // Show message if not in Teams
  if (!isInTeams) {
    return <NotInTeamsMessage />;
  }

  // Render ChatContextValidator component when in Teams context
  return <ChatContextValidator />;
}
