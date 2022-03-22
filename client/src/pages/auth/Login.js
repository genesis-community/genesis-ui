import { Component } from "react";
import UnauthNavBar from "../../components/UnauthNavBar";
import Hero from "../../assets/images/hero.jpeg";
import GenesisLogo from "../../assets/images/genesisLogo.png"
import { Card, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import Settings from "../../Settings";
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
                                <Button variant="success" href={`https://github.com/login/oauth/authorize?client_id=${Settings.githubClientId}&redirect_uri=${Settings.currentPort}/callback`} size={"lg"}>
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