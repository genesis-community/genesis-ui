import React, { Component } from 'react'
import RouteMap from '../../RouteMap';
import { Image, Button, Row, Col } from 'react-bootstrap';
import verify from "../../assets/images/verify.svg"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Link, Navigate } from 'react-router-dom';


class ProcessToken extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadComplete: false,
        }
    }

    componentDidMount = async () => {
        const params = this.parseParams(window.location.search);
        const token = await this.getToken(params.code);
        // localStorage.setItem("token", token);
        const data = await this.props.fetchUserInfo(token);
        this.props.setUserData(data)
        this.setState({ loadComplete: true });
        // window.location.href = RouteMap.LandingPage;
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

    getToken = async (githubToken) => {
        return await fetch(
            (`auth?code=${githubToken}`)
        ).then(response => response.json())
            .then((response) => {
                if (response.error) {
                    throw Error(response);
                }
                return response.token
            })
            .catch((error) => {
                console.log(error);
            })
    }

    render() {
        if (this.state.loadComplete) {
            return (
                <Navigate
                    to={"/"+RouteMap.LandingPage}
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