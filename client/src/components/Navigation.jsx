import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaFlask, FaHistory, FaHome, FaDna } from 'react-icons/fa';

function Navigation() {
    const location = useLocation();

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="w-100 navbar-custom">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="brand-custom">
                    <FaFlask className="me-2" />
                    Drug Analysis
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link
                            as={Link}
                            to="/"
                            className={`nav-link-custom ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            <FaHome className="me-1" />
                            Home
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/analysis"
                            className={`nav-link-custom ${location.pathname === '/analysis' ? 'active' : ''}`}
                        >
                            <FaFlask className="me-1" />
                            Analysis
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/unknown-analysis"
                            className={`nav-link-custom ${location.pathname === '/unknown-analysis' ? 'active' : ''}`}
                        >
                            <FaDna className="me-1" />
                            Unknown Drug
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/history"
                            className={`nav-link-custom ${location.pathname === '/history' ? 'active' : ''}`}
                        >
                            <FaHistory className="me-1" />
                            History
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navigation;