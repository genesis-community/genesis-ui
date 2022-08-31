import { Component } from "react";
import { Row, Col, Image, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import error_404 from "../assets/images/error_404.svg"
import RouteMap from "../RouteMap";

class Error_404 extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Row className="d-flex justify-content-center text-center">
                    <Col xs={6} lg={6}>
                        <Image src={error_404} className="w-100 m-4" />
                    </Col>
                </Row>

                <Row className="text-center">
                    <Col>
                        <h4>Whoops! Looks like you are at the wrong place...&nbsp;&nbsp;Let me take you back!</h4>
                        <h3>Click the button below</h3>
                        <Button variant="warning" as={Link} to={(this.props.userData === null || this.props.userData === "") ? RouteMap.Login : RouteMap.Dashboard} size={"lg"} className="m-3" >Go back to homepage</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Error_404