import { Component, useContext } from 'react';
import { Container, Dropdown, DropdownButton, Nav } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { BiMenu } from 'react-icons/bi'
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
import { FSEContext } from '../Context';
import api from '../logic/api';
export default function Navbar() {
    const context = useContext(FSEContext);
    const history = useHistory();
    
    const logout = () => {
        api.logout();
        history.push('/login');
    }

    return (
        <Nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
            <Container>
                <Link className='navbar-brand' to='/'>FSE Dashboard</Link>
                <div className='collapse, navbar-collapse' id='navbarColor01'>
                    <ul className='navbar-nav'>
                        <li className='nav-item'>
                            <Link className='nav-link' to='submissions'>Submissions</Link>
                        </li>
                    </ul>
                </div>
                <DropdownButton id="username-button" title={context?.username}>
                    <Dropdown.Item onClick={() => history.push(`/profile?username=${context?.username}`)}>Profile</Dropdown.Item>
                    <Dropdown.Item onClick={logout}>Log Out</Dropdown.Item>
                </DropdownButton>
            </Container>
        </Nav >
    )
}
