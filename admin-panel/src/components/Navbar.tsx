import { Component } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class Navbar extends Component {
    render() {
        return (
            <Nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
                <Container fluid>
                    <Link className='navbar-brand' to='/'>FSE Dashboard</Link>
                    <div className='collapse, navbar-collapse' id='navbarColor01'>
                    <ul className='navbar-nav me-auto'>
                        <li className='nav-auto'>
                            <Link className='nav-link active' to='playbill'>Play Bill</Link>
                        </li>
                        <li className='nav-auto'>
                            <Link className='nav-link active' to='playbill'>Play Bill</Link>
                        </li>
                    </ul>
                </div>
                </Container>
            </Nav>
        )    
    }
}