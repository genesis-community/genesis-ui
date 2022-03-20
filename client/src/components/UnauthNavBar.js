import { Navbar, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/components/navbar.css'
import SWLogo from "../assets/images/SWLogo.png"

function UnauthNavBar() {
    return (
        <>
            <Navbar bg="dark">
                <Container>
                    <Navbar.Brand href="#home">
                        <img
                            src={SWLogo}
                            className="nav-logo d-inline-block align-top container"
                            alt="Stark and Wayne Logo"
                        />
                    </Navbar.Brand>
                </Container>
            </Navbar>
        </>
    )
}

export default UnauthNavBar;