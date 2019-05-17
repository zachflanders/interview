import React from 'react';
import {Link} from 'react-router-dom';
import './Nav.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

class Nav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render(){
    return(
      <div>
      <AppBar id='nav-bar' position='relative'>
        <Toolbar>
          <Typography component={Link} to='/' variant="h6" color="inherit" className='title'>
            mySidewalk Interview
          </Typography>
          <Button component={Link} to='/reviews' color="inherit">View Reviews</Button>
          <Button component={Link} to='/review/add' color="inherit">Add Review</Button>
          <Button component={Link} to='/geojson' color="inherit">GeoJSON Viz</Button>

        </Toolbar>
      </AppBar>
    </div>
    )
  }
}

export default Nav;
