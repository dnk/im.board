import { Card, CardContent, CssBaseline, createTheme, useMediaQuery } from '@mui/material';
import Releases from './Releases';
import Tests from './Tests';
import { ThemeProvider } from '@emotion/react';

function App() {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkTheme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    },
  });

  return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Card sx={{ display: 'flex', flexWrap: 'wrap-reverse' }} variant='outlined'>
            <CardContent sx={{ flexGrow: 1 }}>
              <Releases />
            </CardContent>
            <CardContent sx={{ flexGrow: 1 }}>
              <Tests />
            </CardContent>
        </Card>
      </ThemeProvider>
  );
}

export default App;
