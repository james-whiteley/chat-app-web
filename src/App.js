import React, { Component } from "react";
import io from "socket.io-client";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import './App.css';
import SignIn from './pages/SignIn';
import Chat from './pages/Chat';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: null,
      signedIn: false
    };
  }

  componentDidMount() {
    var socket = io("http://127.0.0.1:3001");
    
    this.setState({ socket: socket });
    socket.on('connect', () => {
      var session = localStorage.getItem('connection');

      if (session) {
        this.setState({ signedIn: true });

        // Parse session object
        session = JSON.parse(session);
        
        this.updateSession(session, socket.id);
        // Attach existing username to socket
        socket.emit('set username', session.username);

        // Join personal room
        socket.emit('join room', session.room);
      }
    });
  }

  updateSession = (session, socketId) => {
    var username = session.username;
    var updatedSession = {
			username: username,
      room: session.room,
			socketId: socketId
		};
    
    localStorage.setItem('connection', JSON.stringify(updatedSession));
  }

  render() {
    if (!this.state.socket) return null;

    return (
      <Router>
        {this.state.signedIn ? (
        <Redirect to="/chat" />
        ): null}
        <Switch>
          <Route exact path="/" render={() => <SignIn state={this.state} />} />
          <Route exact path="/chat/:roomId" render={(props) => <Chat {...props} state={this.state} />} />
          <Route exact path="/chat" render={(props) => <Chat {...props} state={this.state} />} />
        </Switch>
      </Router>
    );
  }
}

export default App;
