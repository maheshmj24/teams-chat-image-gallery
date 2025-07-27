import React from 'react';

class TermsOfUse extends React.Component {
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
        <h1>Terms of Use</h1>

        <h2>Acceptance of Terms</h2>
        <p>
          By using Image Gallery, you agree to these terms of use. This
          application is provided as an open-source solution to help users
          overcome limitations in Microsoft Teams' image browsing capabilities.
        </p>

        <h2>Purpose and Scope</h2>
        <p>
          Image Gallery is designed to provide an enhanced way to view and
          browse images shared in Microsoft Teams chats. It addresses the
          limitation where copied/pasted images don't appear in Teams' native
          "Shared" tab.
        </p>

        <h2>Open Source License</h2>
        <p>
          This application is open source and available under an open source
          license. You are free to:
        </p>
        <ul>
          <li>Use the application for personal or commercial purposes</li>
          <li>Modify and customize the source code</li>
          <li>Distribute and share the application</li>
          <li>Contribute improvements back to the community</li>
        </ul>

        <h2>Microsoft Graph API Compliance</h2>
        <p>
          This application uses Microsoft Graph APIs and must be used in
          compliance with Microsoft's terms of service and your organization's
          policies regarding Microsoft 365 data access.
        </p>

        <h2>Disclaimer</h2>
        <p>
          This application is provided "as is" without warranty of any kind. The
          developer is not responsible for any data loss, security issues, or
          other problems that may arise from using this application.
        </p>

        <h2>User Responsibilities</h2>
        <p>Users are responsible for:</p>
        <ul>
          <li>
            Ensuring they have appropriate permissions to access chat data
          </li>
          <li>Complying with their organization's IT and security policies</li>
          <li>
            Using the application in accordance with Microsoft Teams terms of
            service
          </li>
        </ul>

        <h2>Support and Community</h2>
        <p>
          As an open-source project, support is provided on a community basis
          through our GitHub repository. Contributions, bug reports, and feature
          requests are welcome.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          These terms may be updated from time to time. Continued use of the
          application constitutes acceptance of any changes.
        </p>
      </div>
    );
  }
}

export default TermsOfUse;
