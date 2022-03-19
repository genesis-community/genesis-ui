import { Navbar, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/components/navbar.css'
import GenesisLogo from "../assets/images/genesisLogo.png"
import RouteMap from '../RouteMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faQuestion, faQuestionCircle, faUser } from "@fortawesome/free-solid-svg-icons";

function AuthNavBar() {
    return (
        <>
            <Navbar bg="dark">
                <Container>
                    <Navbar.Brand href={RouteMap.Login}>
                        <img
                            src={GenesisLogo}
                            className="nav-logo d-inline-block align-top container"
                            alt="Genesis Logo"
                        />
                    </Navbar.Brand>
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text className='text-white mx-4'>
                            Help&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} />
                        </Navbar.Text>

                        <Navbar.Text className='text-white'>
                            Prakshal Jain&nbsp;&nbsp;<FontAwesomeIcon icon={faAngleUp} />
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}

export default AuthNavBar;