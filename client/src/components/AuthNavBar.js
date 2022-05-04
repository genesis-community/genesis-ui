import React, { useState } from 'react';

import { Navbar, Container, NavDropdown, Image, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/components/navbar.css'
import GenesisLogo from "../assets/images/genesisLogo.png"
import RouteMap from '../RouteMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOut, faQuestionCircle, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom"

function AuthNavBar(props) {

    const userData = props.userData
    if (userData === null || typeof userData !== 'object') {
        return "";
    }

    const logOutUser = async () => {
        const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");
        localStorage.removeItem("remember_me")
        localStorage.removeItem("token");
        sessionStorage.removeItem("token")
        window.location.href = RouteMap.Login
        await logout(token);
    }

    // logout
    const logout = async (githubToken) => {
        return await fetch(
          (`logout?token=${githubToken}`)
        ).then(response => response.json())
          .then((response) => {
            if (response.error) {
              throw Error(response);
            }
          })
          .catch((error) => {
            console.log(error)
          })
      }

    return (
        <>
            <Navbar bg="dark">
                <Container>
                    <Navbar.Brand as={Link} to={RouteMap.Dashboard}>
                        <img
                            src={GenesisLogo}
                            className="nav-logo d-inline-block align-top container"
                            alt="Genesis Logo"
                        />
                    </Navbar.Brand>


                    <Navbar.Collapse className="justify-content-end">
                        <Image src={userData.avatar_url} roundedCircle={true} className="avatar" />
                        <NavDropdown title={(userData.name === undefined || userData.name === null || userData.name.length === 0) ? userData.login : userData.name} className='text-white'>

                            <NavDropdown.Item href={userData.html_url} target={"_blank"}>
                                <FontAwesomeIcon icon={faGithub} />&nbsp;&nbsp;GitHub Profile
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={logOutUser} className={"text-danger"}><FontAwesomeIcon icon={faSignOut} />&nbsp;&nbsp;Log Out</NavDropdown.Item>

                        </NavDropdown>

                        <Nav.Link className='mx-4 text-white' href="https://www.youtube.com/user/StarkAndWayne" target="_blank">
                            Help&nbsp;&nbsp;<FontAwesomeIcon icon={faQuestionCircle} />
                        </Nav.Link>

                        <Nav.Link className='mx-4 text-white' as={Link} to={RouteMap.QuickView}>
                            QuickView&nbsp;&nbsp;<FontAwesomeIcon icon={faPaperPlane} />
                        </Nav.Link>
                    </Navbar.Collapse>

                </Container>
            </Navbar>
        </>
    )
}

export default AuthNavBar;