import React, { Component } from 'react'
import RouteMap from '../../RouteMap';
import { Image, Button, Row, Col } from 'react-bootstrap';
import verify from "../../assets/images/verify.svg"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Link, Navigate } from 'react-router-dom';
import Settings from '../../Settings';


class ProcessToken extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadComplete: false,
        }
    }

    componentDidMount = async () => {
        const params = this.parseParams(window.location.search);

        const token = await this.props.getUserInfo(params.code);

        // Check localStorage to see if token needs to be remembered or not?
        const isRemember = this.props.isRemember;
        // If token needs to be remembered, it is in the localStorage as --> (remember_me: true). Otherwise, it does not exist in localStore.
        
        if(isRemember !== null){    // If it exist --> Store in localStorage
            localStorage.setItem("token", token)
            sessionStorage.removeItem("token")
        }
        else{   // Otherwise --> Store in sessionStorage
            sessionStorage.setItem("token", token)
            localStorage.removeItem("token")
        }

        this.setState({ loadComplete: true });
    }

    parseParams = (querystring) => {
        // parse query string
        const params = new URLSearchParams(querystring);

        const obj = {};

        // iterate over all keys
        for (const key of params.keys()) {
            if (params.getAll(key).length > 1) {
                obj[key] = params.getAll(key);
            } else {
                obj[key] = params.get(key);
            }
        }

        return obj;
    };

    render() {
        if (this.state.loadComplete) {
            return (
                <Navigate
                    to={this.props.existingUser ? RouteMap.Dashboard : RouteMap.LandingPage}
                />
            )
        }

        return (
            <div>
                <Row className="d-flex justify-content-center text-center">
                    <Col xs={3} lg={3}>
                        <Image src={verify} className="w-100 m-4" />
                    </Col>
                </Row>

                <Row className='text-center m-4'>
                    <Col>
                        <h1>Redirecting...</h1>
                        <h4>We are authorizing your details with GitHub&nbsp;&nbsp;<FontAwesomeIcon icon={faGithub} /></h4>
                        <h5>If the page does not reload soon...</h5>
                        <Button variant="warning" as={Link} to={(this.props.userData === null || this.props.userData === "") ? RouteMap.Login : RouteMap.Dashboard} size={"lg"} className="m-3" >Click here</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default ProcessToken