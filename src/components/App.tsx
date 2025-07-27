import {
  FluentProvider,
  Spinner,
  teamsDarkTheme,
  teamsHighContrastTheme,
  teamsLightTheme,
  tokens,
} from '@fluentui/react-components';
import { useTeamsUserCredential } from '@microsoft/teamsfx-react';
import { useMemo } from 'react';
import {
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
} from 'react-router-dom';
import config from '../config';
import { TeamsFxContext } from './Context';
import Privacy from './Privacy';
import TeamsContextValidator from './TeamsContextValidator';
import TermsOfUse from './TermsOfUse';

export default function App() {
  const { loading, theme, themeString, teamsUserCredential } =
    useTeamsUserCredential({
      initiateLoginEndpoint: config.initiateLoginEndpoint,
      clientId: config.clientId,
    });

  let appliedTheme;
  if (themeString === 'dark') {
    appliedTheme = teamsDarkTheme;
  } else if (themeString === 'contrast') {
    appliedTheme = teamsHighContrastTheme;
  } else {
    appliedTheme = {
      ...teamsLightTheme,
      colorNeutralBackground3: '#eeeeee',
    };
  }

  const contextValue = useMemo(
    () => ({ theme, themeString, teamsUserCredential }),
    [theme, themeString, teamsUserCredential]
  );

  return (
    <TeamsFxContext.Provider value={contextValue}>
      <FluentProvider
        theme={appliedTheme}
        style={{ background: tokens.colorNeutralBackground3 }}
      >
        <Router>
          {loading ? (
            <Spinner style={{ margin: 100 }} />
          ) : (
            <Routes>
              <Route path='/privacy' element={<Privacy />} />
              <Route path='/termsofuse' element={<TermsOfUse />} />
              <Route path='/tab' element={<TeamsContextValidator />} />
              <Route path='*' element={<Navigate to={'/tab'} />}></Route>
            </Routes>
          )}
        </Router>
      </FluentProvider>
    </TeamsFxContext.Provider>
  );
}
