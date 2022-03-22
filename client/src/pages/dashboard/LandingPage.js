import { Component } from "react";
import { Card, Row, Col, Nav, Button } from 'react-bootstrap';
import AuthNavBar from "../../components/AuthNavBar";
import RouteMap from '../../RouteMap';
import "../../css/pages/landing_page.css"
import LandingHero from "../../assets/images/landingHero.png"
import Confetti from 'react-confetti'
import LandingPageSteps from "../../data/LandingPageSteps"

class LandingPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            steps: LandingPageSteps,
            currentStep: -1
        }
    }

    componentDidUpdate = () => {
        console.log('update from componentDidUpdate', this.props);
    }

    componentDidCatch = () => {
        console.log('update from componentDidCatch', this.props);
    }

    renderCurrentStep = () => {
        if (this.state.currentStep === -1) {
            return (
                <Card.Body>
                    <Row>
                        <Col>
                            <h2>Congratulations! Your Genesis account has been created</h2>
                            <a href={"https://genesisproject.io"} target="_blank">
                                <img
                                    src={LandingHero}
                                    className="landingHero m-2"
                                    alt="Genesis Logo"
                                />
                            </a>
                            <h4>Not sure what to do now?</h4>
                            <h5>
                                Click Next below to follow the tutorial.
                            </h5>
                        </Col>
                    </Row>
                </Card.Body>
            )
        }
        else {
            return (
                <Card.Body>
                    <Row>
                        <Col>
                            {(this.state.steps[this.state.currentStep].title === undefined || this.state.steps[this.state.currentStep].title === null) ?
                                ""
                                :
                                <h2>{this.state.steps[this.state.currentStep].title}</h2>
                            }
                            {(this.state.steps[this.state.currentStep].image === undefined || this.state.steps[this.state.currentStep].image === null) ?
                                ""
                                :
                                <img
                                    src={this.state.steps[this.state.currentStep].image}
                                    className="landingHero m-2"
                                    alt={`Step ${this.state.currentStep} image`}
                                />
                            }

                            {(this.state.steps[this.state.currentStep].description === undefined || this.state.steps[this.state.currentStep].description === null) ?
                                ""
                                :
                                <h4>
                                    {this.state.steps[this.state.currentStep].description}
                                </h4>
                            }
                        </Col>
                    </Row>
                </Card.Body>
            )
        }
    }

    render() {
        return (
            <div>
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                />
                <AuthNavBar />

                <Row className="d-flex justify-content-center min-vh-50">
                    <Col xs={12} lg={9}>
                        <Card className="m-4 h-100 mt-5 text-center inviteBox text-dark" text="light">

                            {this.renderCurrentStep()}

                            <Card.Footer>
                                <Row>
                                    <Col className="d-flex justify-content-start">
                                        {(this.state.currentStep < (this.state.steps.length - 1)) ?
                                            <Nav.Link href={RouteMap.Dashboard} className={"text-dark"}>
                                                <b>Skip</b>
                                            </Nav.Link>
                                            :
                                            ""
                                        }
                                    </Col>

                                    {/* Next will show the pictures and small descriptions of where everything is on the dashboard. Save the steps in the state. */}

                                    <Col className="d-flex justify-content-end">
                                        {(this.state.currentStep < (this.state.steps.length - 1)) ?
                                            <Button variant="success" onClick={() => { this.setState({ currentStep: this.state.currentStep + 1 }) }}>Next</Button>
                                            :
                                            <Nav.Link href={RouteMap.Dashboard}>
                                                <Button variant="primary">Finish</Button>
                                            </Nav.Link>
                                        }

                                    </Col>
                                </Row>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default LandingPage