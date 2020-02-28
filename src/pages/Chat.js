import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import OnlineUsers from './OnlineUsers';
import ChatRoom from './ChatRoom';

const drawerWidth = 240;

const styles = theme => ({
	root: {
	  display: 'flex',
	},
	toolbar: {
	  paddingRight: 24, // keep right padding when drawer closed
	},
	toolbarIcon: {
	  display: 'flex',
	  alignItems: 'center',
	  justifyContent: 'flex-end',
	  padding: '0 8px',
	  ...theme.mixins.toolbar,
	},
	appBar: {
	  zIndex: theme.zIndex.drawer + 1,
	  transition: theme.transitions.create(['width', 'margin'], {
	    easing: theme.transitions.easing.sharp,
	    duration: theme.transitions.duration.leavingScreen,
	  }),
	},
	appBarShift: {
	  marginLeft: drawerWidth,
	  width: `calc(100% - ${drawerWidth}px)`,
	  transition: theme.transitions.create(['width', 'margin'], {
	    easing: theme.transitions.easing.sharp,
	    duration: theme.transitions.duration.enteringScreen,
	  }),
	},
	menuButton: {
	  marginRight: 36,
	},
	menuButtonHidden: {
	  display: 'none',
	},
	title: {
	  flexGrow: 1,
	},
	drawerPaper: {
	  position: 'relative',
	  whiteSpace: 'nowrap',
	  width: drawerWidth,
	  transition: theme.transitions.create('width', {
	    easing: theme.transitions.easing.sharp,
	    duration: theme.transitions.duration.enteringScreen,
	  }),
	},
	drawerPaperClose: {
	  overflowX: 'hidden',
	  transition: theme.transitions.create('width', {
	    easing: theme.transitions.easing.sharp,
	    duration: theme.transitions.duration.leavingScreen,
	  }),
	  width: theme.spacing(7),
	  [theme.breakpoints.up('sm')]: {
	    width: theme.spacing(9),
	  },
	},
	appBarSpacer: theme.mixins.toolbar,
	content: {
	  flexGrow: 1,
	  height: '100vh',
	  overflow: 'auto',
	},
	container: {
	  paddingTop: theme.spacing(4),
	  paddingBottom: theme.spacing(4),
	},
	paper: {
	  padding: theme.spacing(2),
	  display: 'flex',
	  overflow: 'auto',
	  flexDirection: 'column',
	},
	fixedHeight: {
	  height: 240,
	},
	footer: {
	  padding: theme.spacing(3, 2),
	  marginTop: 'auto',
	  backgroundColor:
	    theme.palette.type === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
	},
});

class Chat extends Component {
	constructor(props) {
		super(props);

		this.state = {
			chatRoom: null,
			open: true,
			db: null
		}

		this.setRoomId = this.setRoomId.bind(this);
		this.updateChatRoom = this.updateChatRoom.bind(this);

		this.chatFrameComponentElement = React.createRef();
		this.chatRoomRef = React.createRef();

		this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
		this.handleDrawerClose = this.handleDrawerClose.bind(this);
	}

	componentDidMount() {
		let request = this.readDB();

    request.onerror = function(event) {
      //console.log(request.errorCode);
    }

    request.onupgradeneeded = function(event) {
      let db = event.target.result;

      // Create messages object store
      let messagesOS = db.createObjectStore('messages', { autoIncrement: true });

			// Create indexes on to and from columns to search later
			messagesOS.createIndex('messageToAndFrom', ['to', 'from'], { unique: false });
    }

		let that = this;
		request.onsuccess = function(event) {
			let db = event.target.result;

			that.setState({ db: db });
		}
	}

	readDB = () => {
		return indexedDB.open('chat');
	}

	handleDrawerOpen() {
    this.setState({ open: true });
  };
  
	handleDrawerClose() {
    this.setState({ open: false });
  };

	updateChatRoom(roomId, username) {
		this.chatRoomRef.current.updateChatRoom(roomId, username);
	}

	setRoomId(roomId) {
		if (roomId) {
			this.setState({ chatRoom: roomId });
		}
	}

	render() {
		const { classes, ...other } = this.props;
		
		if (!this.state.db) return null;
		
		return (
			<div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, this.state.open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={this.handleDrawerOpen}
            className={clsx(classes.menuButton, this.state.open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Chat
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
        }}
        open={this.state.open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={this.handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
					<OnlineUsers {...this.props} updateChatRoom={this.updateChatRoom} setRoomId={this.setRoomId} />
				</List>
      </Drawer>
      <main className={classes.content}>
				<div className={classes.appBarSpacer} />
				<ChatRoom {...other} ref={this.chatRoomRef} db={this.state.db} />
      </main>
    </div>
		);
	}
}

export default withRouter(withStyles(styles)(Chat));