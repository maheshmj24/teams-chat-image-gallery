import React from 'react';

class Privacy extends React.Component {
  render() {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '20px',
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6',
          backgroundColor: '#f5f5f5',
        }}
      >
        <h1>Privacy Statement</h1>

        <h2>Data Collection and Usage</h2>
        <p>Image Gallery is designed with privacy in mind. This application:</p>
        <ul>
          <li>
            <strong>Does not store</strong> any of your chat data, images, or
            personal information
          </li>
          <li>
            <strong>Does not transmit</strong> your data to any external servers
            or third parties
          </li>
          <li>
            <strong>Only accesses</strong> Microsoft Teams chat data through
            official Microsoft Graph APIs
          </li>
          <li>
            <strong>Processes data locally</strong> within your browser session
          </li>
        </ul>

        <h2>Microsoft Graph API Usage</h2>
        <p>
          This app uses Microsoft Graph APIs to read chat messages and retrieve
          images shared in your Teams conversations. All data access is governed
          by Microsoft's security and privacy policies, and you maintain full
          control through your Microsoft 365 permissions.
        </p>

        <h2>Authentication</h2>
        <p>
          Authentication is handled through Microsoft's secure Single Sign-On
          (SSO) system. We do not store your credentials or authentication
          tokens.
        </p>

        <h2>Open Source Commitment</h2>
        <p>
          This application is open source, meaning the source code is publicly
          available for review. You can verify our privacy practices by
          examining the code at our GitHub repository.
        </p>

        <h2>Contact</h2>
        <p>
          If you have any questions about this privacy statement, please contact
          the developer at the GitHub repository or through the contact
          information provided in the app manifest.
        </p>
      </div>
    );
  }
}

export default Privacy;
