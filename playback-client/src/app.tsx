import './frontend/css/bootstrap.css';
import './frontend/css/playback-client.css'
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Login from './frontend/pages/Login';
import Controls from './frontend/pages/Controls';
import backendInterface from './frontend/backend_interface';

interface IState {
    loggedIn: boolean
}

export default class App extends Component<{}, IState> {
    constructor(props: {}) {
        super(props)
    
        this.state = {
            loggedIn: false
        }
    }
    
    // Hot-reloading is really annoying without this.
    componentDidMount() {
        backendInterface.getCredentials().then((value) => {
            if (value) {
                this.setState({ loggedIn: true });
            }
        })
    }

    render() {
        if (this.state.loggedIn) {
            return <Controls />
        } else {
            return <Login onLoggedIn={() => {
                this.setState({ loggedIn: true });
                backendInterface.launchMediaPlayer();
            }} />
        }
    }
}



function render() {
    ReactDOM.render(<App />, document.getElementById('root'));
}

render();