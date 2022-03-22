import { Navbar, Container, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/components/navbar.css'
import GenesisLogo from "../assets/images/genesisLogo.png"
import RouteMap from '../RouteMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faQuestion, faQuestionCircle, faUser } from "@fortawesome/free-solid-svg-icons";

function AuthNavBar(props) {
    const userData = props.userData
    // if(userData === null || typeof userData !== 'object'){
    //     return "";
    // }

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
                    <NavDropdown title={"Prakshal Jain"} className='text-white'>
                            <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action4">Another action</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action5">
                                Something else here
                            </NavDropdown.Item>
                        </NavDropdown>

                        <Navbar.Text className='text-white mx-4'>
                            Help&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} />
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}

export default AuthNavBar;