import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import RouteMap from "./RouteMap";

import React, {Component} from 'react';

import Login from "./pages/auth/Login";
import LandingPage from "./pages/dashboard/LandingPage";
import Dashboard from "./pages/dashboard/Dashboard"
import Error_404 from "./pages/Error_404";
import ProcessToken from "./pages/auth/ProcessToken";


class AllRoutes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: null
    }
  }

  fetchUserInfo = async (token) => {
    return await fetch(
      (`https://api.github.com/user`),
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: `application/vnd.github.v3+json`
        }
      }
    )
      .then((response) => response.json())
      .catch((error) => {
        console.log(error);
      })
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path={RouteMap.Login} exact element={<Login />} />
          <Route path={RouteMap.LandingPage} exact element={<LandingPage userData={this.state.userData} />} />
          <Route path={RouteMap.Dashboard} exact element={<Dashboard userData={this.state.userData} />} />
          <Route path={RouteMap.Callback} exact element={<ProcessToken fetchUserInfo={this.fetchUserInfo} setUserData={(data) => {this.setState({userData: data})}} />} />
          <Route path={RouteMap.Error_404} exact element={<Error_404 />} userData={this.state.userData} />

          <Route path="*" element={<Navigate to={RouteMap.Error_404} />} />
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