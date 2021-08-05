import { Component } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import '../css/dashboard.css'
import Navbar from '../components/Navbar'
import Submissions from './Submissions'

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
                            Home
                        </Route>
                    </Switch>
                </div>
            </Router>
        )
    }
}