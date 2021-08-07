import { Component, useContext, useEffect } from 'react'
import { Route, BrowserRouter as Router, Switch, useLocation, useHistory, withRouter, Redirect } from 'react-router-dom'
import './css/dashboard.css'
import Navbar from './components/Navbar'
import Submissions from './pages/Submissions'
import Dashboard from './pages/Dashboard'
import { FSEContext } from './Context'
import api from './logic/api'
import Login from './pages/Login'

function Header() {
    const location = useLocation();
    return location.pathname !== '/login' ? <Navbar /> : null;
}

export default function App() {
    const context = useContext(FSEContext)
    return (
        <Router basename='admin'>
            <Header />
            <Switch>
                <Route path='/login'>
                    <Login />
                </Route>
                {
                    context ? (
                        <>
                            <Route path='/playbill'>
                                Playbill
                            </Route>
                            <Route path='/submissions'>
                                <Submissions />
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