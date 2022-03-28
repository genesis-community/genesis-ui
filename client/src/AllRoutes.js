import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import RouteMap from "./RouteMap";

import React, { Component } from 'react';
import { Image, Row, Col } from 'react-bootstrap';

import Login from "./pages/auth/Login";
import LandingPage from "./pages/dashboard/LandingPage";
import Dashboard from "./pages/dashboard/Dashboard"
import Error_404 from "./pages/Error_404";
import ProcessToken from "./pages/auth/ProcessToken";
import AuthNavBar from "./components/AuthNavBar";
import borderedGenesis from "./assets/images/borderedGenesis.png"
import "./css/pages/loading.css"

class AllRoutes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // loading: true,
      userData: null,
      redirectUrl: null,
      redirect: false,
    }
  }

  componentDidMount = () => {
    this.setState({
      userData: null,
      redirectUrl: null,
      redirect: false,
    });

    // Get the token from localstore or sessionStorage
    const isRemember = localStorage.getItem("remember_me");
    const localStorage_token = localStorage.getItem("token");
    const sessionStorage_token = sessionStorage.getItem("token");

    this.setState({ userData: true },
      (async () => {
        if (isRemember !== null && localStorage_token !== null) {   // When token is in localStorage
          await this.fetchUserInfo(localStorage_token)
        }

        else if (isRemember === null && sessionStorage_token !== null) {
          await this.fetchUserInfo(sessionStorage_token)
        }

        this.setState({ redirect: true });
      })
    );

    // setTimeout(() => {
    //   this.setState({ loading: false });
    // }, 3000)
  }


  fetchUserInfo = async (token) => {
    return (await fetch(
      (`https://api.github.com/user`),
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: `application/vnd.github.v3+json`
        }
      }
    )
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        else {
          throw new Error("An error occured while getting user info")
        }
      })
      .then(data => {
        this.setState({ userData: data })
      })
      .catch((error) => {
        console.log("Update")
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        localStorage.removeItem("remember_me");
        window.location.href = RouteMap.Login;
      })
    )
  }

  renderProtectedRoutes = () => {
    if (this.state.userData === null || this.state.userData === undefined) {
      this.setState({ redirectUrl: RouteMap.Login });
    }

    return ([
      <Route path={RouteMap.LandingPage} exact element={this.RouteWithAuthNav(this.state.userData, LandingPage)} key="routeMap" />,
      <Route path={RouteMap.Dashboard} exact element={this.RouteWithAuthNav(this.state.userData, Dashboard)} key="Dashboard" />
    ])
  }

  RouteWithAuthNav = (userData, component) => {
    return ([
      <AuthNavBar userData={userData} />,
      React.createElement(component, userData)
    ])
  }

  render() {
    // if (this.state.loading) {
    //   return (
    //     <div className="d-flex justify-content-center align-items-center vh-100">
    //       <Image src={borderedGenesis} className="img-thumbnail border-0 fade-in" />
    //     </div>
    //   )
    // }

    return (
      <BrowserRouter>
        <Routes>
          <Route path={RouteMap.Login} exact element={<Login userData={this.state.userData} />} key="Login" />
          <Route path={RouteMap.Callback} exact element={<ProcessToken fetchUserInfo={this.fetchUserInfo} isRemember={localStorage.getItem("remember_me")} />} key="ProcessToken" />
          <Route path={RouteMap.Error_404} exact element={<Error_404 />} key="Error_404" />

          {this.renderProtectedRoutes()}

          {this.state.redirect ?
            <Route path="*" element={<Navigate to={this.state.redirectUrl} />} key="Navigate" />
            :
            (() => {
              if (!this.state.redirectUrl) {
                this.setState({ redirectUrl: RouteMap.Error_404 })
              }
              return "";
            })()
          }
        </Routes>
      </BrowserRouter>
    )
  }
}

export default AllRoutes;

/*
This keeps track of all the pages. To add a page, 
1. add its URL to the RouteMap.js file
2. Add it as --> <Route path={RouteMap.SomeURL} exact element={<Component />} /> inside the <Routes></Routes>
*/