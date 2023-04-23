import { Grid } from '@mui/material';
import './App.css';
import Releases from './Releases';
import Tests from './Tests';


function App() {
  return (
    <div className="App">
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Releases />
        </Grid>
        <Grid item xs={4}>
          <Tests />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
