import React, { useEffect } from 'react'
import RouteMap from '../../RouteMap';
import { Image, Button, Row, Col } from 'react-bootstrap';
import verify from "../../assets/images/verify.svg"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Link } from 'react-router-dom';

const parseParams = (querystring) => {

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

export const ProcessToken = (props) => {
    const params = parseParams(window.location.search);
    useEffect(() => {
        getToken(params.code);
    })
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
                    <Button variant="warning" as={Link} to={(props.userData === null || props.userData === "") ? RouteMap.Login : RouteMap.Dashboard} size={"lg"} className="m-3" >Click here</Button>
                </Col>
            </Row>
        </div>
    )
}

async function getToken(githubToken) {
    try {
        await fetch(
            (`auth?code=${githubToken}`)
        ).then(response => response.json())
            .then((response) => {
                console.log(response)
                if (response.error) {
                    throw Error(response);
                }
                localStorage.setItem("token", response.token);
                window.location.href = RouteMap.LandingPage;
            })
    } catch (error) {
        console.log(error);
    }
}
