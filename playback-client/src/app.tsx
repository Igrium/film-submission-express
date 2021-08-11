import './css/bootstrap.css';
import './css/playback-client.css'
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Login from './pages/Login';

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