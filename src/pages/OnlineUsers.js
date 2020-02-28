import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

function UserListItem(props) {
	var username = props.user.username;
	var initial = username.charAt(0).toUpperCase();

	return (
		<ListItem 
			button 
			onClick={() => {
				props.history.push(`/chat/${props.user.room}`);
				props.setRoomId(props.user.room);
				props.updateChatRoom(props.user.room, username);
			}}>
			<ListItemAvatar>
    	  <Avatar>{initial}</Avatar>
    	</ListItemAvatar>
    	<ListItemText primary={username} />
    </ListItem>
	)
}

function UserList(props) {
	return (
	  <div>
			{props.users.map((item, key) => {
				if (item.username && item.room !== props.room) {
					return <UserListItem {...props} user={item} key={key} />
				}
				return null;
			})}
	  </div>
	);
}

class OnlineUsers extends Component {
	constructor(props) {
		super(props);

		this.state = {
			users: []
		};

		this.updateOnlineUsers();
	}

	componentDidMount() {
		this.socket.emit('get online users');
	}

	updateOnlineUsers = () => {
		this.socket = this.props.state.socket;
		var session = localStorage.getItem('connection');

		if (session) {
      // Parse session object
      session = JSON.parse(session);

			this.room = session.room;
		
			let that = this;
			this.socket.on('online users', function(users) {
				that.setState({ users: users });
			});
		}
	}

	render() {
		return (
			<UserList {...this.props} users={this.state.users} room={this.room} />
		);
	}
}

export default withRouter(OnlineUsers);