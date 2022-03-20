import { Component } from "react";
import UnauthNavBar from "../../components/UnauthNavBar";
import Hero from "../../assets/images/hero.jpeg";
import GenesisLogo from "../../assets/images/genesisLogo.png"
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import RouteMap from '../../RouteMap';
import "../../css/pages/landing_page.css";

class Homepage extends Component {
    render() {
        return (
            <div style={{ backgroundImage: `url('${Hero}')`, height: "100vh", backgroundPosition: "center", backgroundSize: "cover" }} className="bg-image">
                <UnauthNavBar />

                <Row className="d-flex justify-content-center min-vh-50">
                    <Col xs={12} lg={9}>
                        <Card className="m-4 h-100 mt-5 bg-opacity-75 text-center gradient_card" bg="dark" text="light">
                            <Card.Header><h1>Log In</h1></Card.Header>
                            <Card.Body>
                                <img
                                    src={GenesisLogo}
                                    className="nav-logo d-inline-block align-top container m-4"
                                    alt="Genesis Logo"
                                />
                                <p className="mb-4">
                                    Genesis helps you build your cloud, leveraging our best practices for BOSH, credentials storage, Cloud Foundry, services, and more.
                                    It takes the guesswork out of deployments and upgrades, and gives you advanced automation workflows on top of that.
                                </p>
<<<<<<< HEAD
                                <Button variant="success" href={"https://github.com/login/oauth/authorize?client_id=d8ca7de576a6e29f75ca&redirect_uri=http://localhost:3000/callback"} size={"lg"}>
=======
                                <Button variant="success" href={"https://github.com/login/oauth/authorize?client_id=d8ca7de576a6e29f75ca&redirect_uri=http://localhost:8000/oauth/redirect"} size={"lg"}>
>>>>>>> e435cb8f048a98b3de6d3f30a64c4a0039f09c95
                                    <FontAwesomeIcon icon={faGithub} />&nbsp;&nbsp;Login with <b>GitHub</b>
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Homepage