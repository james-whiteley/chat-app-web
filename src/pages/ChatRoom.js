import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';

const styles = theme => ({
  table: {
    minWidth: 650,
  },
  chatSection: {
    width: '100%',
		height: 'calc(100vh - 56px)',
		[`${theme.breakpoints.up('sm')}`]: {
      height: 'calc(100vh - 64px)',
    },
		[`${theme.breakpoints.down('lg')} and (orientation: portrait)`]: {
      height: 'calc(100vh - 48px)',
    },
		backgroundImage: "url(/chat-background.png)"
  },
  headBG: {
      backgroundColor: '#e0e0e0'
  },
  borderRight500: {
      borderRight: '1px solid #e0e0e0'
  },
  messageArea: {
		height: 'calc(100vh - 100px - 56px)',
		[`${theme.breakpoints.up('sm')}`]: {
      height: 'calc(100vh - 100px - 64px)',
    },
		[`${theme.breakpoints.down('lg')} and (orientation: portrait)`]: {
      height: 'calc(100vh - 100px - 48px)',
    },
    overflowY: 'auto'
  }
});

class ChatRoom extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			room: '/',
			username: null,
			messages: []
		};
	}

	componentDidMount() {
		this.db = this.props.db;
		this.socket = this.props.state.socket;

		var that = this;

		this.socket.on('message', function(message) {
			if (message.room === that.state.room) {
				// Save message to IndexedDB database
				this.saveMessage(message);

				that.printMessages([ message ]);
			} else {
				console.log('WRONG ROOM');
			}
		});
	}

	getAllMessages = (room) => {
		var transaction = this.db.transaction(["messages"], "readonly");
		var objectStore = transaction.objectStore("messages");
		var messagesIndex = objectStore.index('messageToAndFrom');
		var keyRange = IDBKeyRange.bound(['', room], [room, '']);
		var messagesCursor = messagesIndex.openCursor(keyRange);

		let messages = [];

		messagesCursor.onsuccess = function(event) {
			let cursor = event.target.result;
      if (cursor) {
				messages.push(cursor.value);
        cursor.continue();
      }
		}

		let that = this;
		transaction.oncomplete = function(event) {
		  // Sort messages by timestamp
			messages.sort(that.sortMessages);
			that.printMessages(messages);
		};

		transaction.onerror = function(event) {
		  // Don't forget to handle errors!
		};
	}

	sortMessages = (a, b) => {
	  if ( a.timestamp < b.timestamp ){
	    return -1;
	  }

	  if ( a.timestamp > b.timestamp ){
	    return 1;
	  }

	  return 0;
	}

	updateChatRoom = (roomId, username) => {
		this.setState({ 
			room: roomId,
			username: username,
			messages: []
		});

		this.getAllMessages(roomId);
	}

	printMessages = (messages) => {
		console.log(messages);
		let formattedMessages = [];
		
		for (var key in messages) {
			let message = messages[key];

			var date = new Date(message.timestamp); 
			var hours = date.getHours();
			var minutes = "0" + date.getMinutes();
			var seconds = "0" + date.getSeconds();

			var timestamp = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

			let formattedMessage = {
				message: message.message,
				to: message.to,
				from: message.from,
				timestamp: timestamp
			}
			
			formattedMessages.push(formattedMessage);
		}
		
		this.setState({
			messages: [...this.state.messages, ...formattedMessages]
		});
	}

	saveMessage = (message) => {
		var transaction = this.db.transaction(["messages"], "readwrite");

		transaction.oncomplete = function(event) {
		  //console.log("All done!");
		};

		transaction.onerror = function(event) {
		  // Don't forget to handle errors!
		};

		var objectStore = transaction.objectStore("messages");
		
		var messageData = {
			message: message.message,
			to: message.room ? '' : this.state.room,
			from: message.room ?? '',
			timestamp: message.timestamp
		}

		var request = objectStore.add(messageData);
		request.onerror = function(event) {
			//console.log(event);
		}
		request.onsuccess = function(event) {
		  //printMessagesog(event);
		}
	}

	sendMessage = (event) => {
		event.preventDefault();

		let message = event.target.message.value;

		// Reset input
		event.target.message.value = "";
    
  	if (message) {
			let messageData = {
				message: message,
				timestamp: Date.now()
			};

			// Save message to IndexedDB database
			this.saveMessage(messageData);
			
			this.printMessages([ messageData ]);
			this.socket.emit('message', { room: this.state.room, message: message, timestamp: Date.now() });
  	}
	}

	render() {
		// Get styles
		const { classes } = this.props;
		
		return (
			<div>
  	    <Grid container component={Paper} className={classes.chatSection}>
  	      <Grid item xs={12}>
  	        <List className={classes.messageArea}>
							{this.state.messages.map((message, key) => {
								console.log(message);
								return (
									<ListItem key={key}>
  	          		  <Grid container direction={message.from === this.state.room ? "row" : "row-reverse"}>
											<Box
												boxShadow={3}
        								bgcolor={message.from === this.state.room ? "#FFFFFF" : "#EFFCFF"}
												align="left"
												width={1/3}
												p={2}
											>
  	          		    	<Grid item xs={12}>
  	          		    	  <ListItemText primary={message.message}></ListItemText>
  	          		    	</Grid>
  	          		    	<Grid item xs={12}>
													<ListItemText secondary={message.timestamp}></ListItemText>
  	          		    	</Grid>
											</Box>
  	          		  </Grid>
  	          		</ListItem>
								);
							})}
  	        </List>
						<Grid container style={{padding: '20px', height: '100px', borderTop: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#FFFFFF'}}>
							<form noValidate onSubmit={this.sendMessage} style={{width: '100%', display: 'flex'}} xs={12}>
  	      	  	<Grid item xs={11}>
  	      	  	  <TextField 
										label="Say something. Anything."
										fullWidth
										id="message"
										name="message"
										autoComplete="off"
									/>
  	      	  	</Grid>
  	      	  	<Grid item xs={1} align="right">
  	      	  	  <Fab 
										color="primary"
										aria-label="add"
										type="submit"
									>
										<SendIcon />
									</Fab>
  	      	  	</Grid>
							</form>
  	      	</Grid>
  	      </Grid>
  	    </Grid>
  	  </div>
		);
	}
}

export default withStyles(styles)(ChatRoom);