import { Component } from 'react';
import { Container, Dropdown, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class Navbar extends Component {
    render() {
        return (
            <Nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
                <Container fluid>
                    <Link className='navbar-brand' to='/'>FSE Dashboard</Link>
                    <div className='collapse, navbar-collapse' id='navbarColor01'>
                    <ul className='navbar-nav'>
                        <li className='nav-item'>
                            <Link className='nav-link' to='submissions'>Submissions</Link>
                        </li>
                    </ul>
                </div>
                </Container>
            </Nav>
        )    
    }
}