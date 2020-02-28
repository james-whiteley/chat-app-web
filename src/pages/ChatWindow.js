import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';

const styles = theme => ({
  table: {
    minWidth: 650,
  },
  chatSection: {
    width: '100%',
    height: 'calc(100vh - )'
  },
  headBG: {
      backgroundColor: '#e0e0e0'
  },
  borderRight500: {
      borderRight: '1px solid #e0e0e0'
  },
  messageArea: {
    height: '70vh',
    overflowY: 'auto'
  }
});

class Chat extends Component {
	render() {
  	const { classes } = this.props;

  	return (
  	  <div>
  	    <Grid container component={Paper} className={classes.chatSection}>
  	      <Grid item xs={12}>
  	        <List className={classes.messageArea}>
  	          <ListItem key="1">
  	            <Grid container>
  	              <Grid item xs={12}>
  	                <ListItemText align="right" primary="Hey man, What's up ?"></ListItemText>
  	              </Grid>
  	              <Grid item xs={12}>
  	                <ListItemText align="right" secondary="09:30"></ListItemText>
  	              </Grid>
  	            </Grid>
  	          </ListItem>
  	        </List>
  	        <Grid container style={{padding: '20px', height: '100px', borderTop: '1px solid rgba(0, 0, 0, 0.12)'}}>
  	          <Grid item xs={11}>
  	            <TextField label="Say something. Anything." fullWidth />
  	          </Grid>
  	          <Grid item xs={1} align="right">
  	            <Fab color="primary" aria-label="add"><SendIcon /></Fab>
  	          </Grid>
  	        </Grid>
  	      </Grid>
  	    </Grid>
  	  </div>
  	);
	}
}

export default withRouter(withStyles(styles)(Chat));