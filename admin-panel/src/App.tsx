import { Component, useContext, useEffect } from 'react'
import { Route, BrowserRouter as Router, Switch, useLocation, useHistory, withRouter, Redirect } from 'react-router-dom'
import './css/dashboard.css'
import Navbar from './components/Navbar'
import Submissions from './pages/Submissions'
import Dashboard from './pages/Dashboard'
import { FSEContext } from './Context'
import Login from './pages/Login'
import Profile from './pages/Profile'
import AccountControl from './pages/AccountControl'
import Playback from './pages/Playback'

function Header() {
    const location = useLocation();
    return location.pathname !== '/login' ? <Navbar /> : null;
}

function ProfileView() {
    const query = new URLSearchParams(useLocation().search);
    const username = query.get('username')
    return <Profile username={username ? username : '[undefined]'} />
}

export default function App() {
    const context = useContext(FSEContext);
    const redirect = context.connected && (context.user === null);
    return (
        <Router basename='admin'>
            <Header />
            <Switch>
                <Route path='/login'>
                    <Login />
                </Route>
                {
                    !redirect ? (
                        <>
                            <Route path='/playbill'>
                                Playbill
                            </Route>
                            <Route path='/submissions'>
                                <Submissions />
                            </Route>
                            <Route path='/playback'>
                                <Playback />
                            </Route>
                            <Route path='/profile'>
                                <ProfileView />
                            </Route>
                            <Route path='/accounts'>
                                <AccountControl />
                            </Route>
                            <Route path='/' exact>
                                <Dashboard />
                            </Route>
                        </>
                    ) : <Redirect to='/login' />
                }
            </Switch>
        </Router>
    )
}