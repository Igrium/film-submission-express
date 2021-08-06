import { Component } from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import '../css/dashboard.css'
import Navbar from '../components/Navbar'
import Submissions from './Submissions'
import Dashboard from './Dashboard'

export default class Panel extends Component {
    render() {
        return (
            <Router basename='admin'>
                <div>
                    <Navbar />
                    <Switch>
                        <Route path='/playbill'>
                            Playbill
                        </Route>
                        <Route path='/submissions'>
                            <Submissions />
                        </Route>
                        <Route path='/'>
                            <Dashboard />
                        </Route>
                    </Switch>
                </div>
            </Router>
        )
    }
}