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
    <ThemeProvider theme={darkTheme} key="theme-provider">
      <CssBaseline />
      <Card sx={{ display: 'flex', flexWrap: 'wrap-reverse' }} variant='outlined' key="card" >
        <CardContent sx={{ flex: 'flex-shrink', padding: '8px' }} key='card-releases'>
          <Releases key="releases" />
        </CardContent>
        <CardContent sx={{ flex: 'flex-shrink', padding: '8px'}} key='card-tests'>
          <Tests key="tests" id={123}/>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}

export default App;
