import './frontend/css/bootstrap.css';
import './frontend/css/playback-client.css'
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Login from './frontend/pages/Login';

export default function App() {
    const [loggedIn, setLoggedIn] = useState(false);

    if (loggedIn) {
        return (
            <div>Logged in!</div>
        )
    } else {
        return <Login />
    }
}


function render() {
    ReactDOM.render(<App />, document.getElementById('root'));
}

render();