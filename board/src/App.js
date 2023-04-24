import { Box, Card, CardContent, CssBaseline, createTheme, useMediaQuery } from '@mui/material';
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
        <Card sx={{ display: 'flex' }} variant='outlined'>
          <Box sx={{ display: 'flex' }}>
            <CardContent >
              <Releases />
            </CardContent>
            <CardContent >
              <Tests />
            </CardContent>
          </Box>
        </Card>
      </ThemeProvider>
  );
}

export default App;
