import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import RouteMap from "./RouteMap";

import React, { useState } from 'react';

import Login from "./pages/auth/Login";
import LandingPage from "./pages/dashboard/LandingPage";
import Dashboard from "./pages/dashboard/Dashboard"
import { ProcessToken } from "./pages/auth/ProcessToken";

function AllRoutes() {
  const [userData, setUserData] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path={RouteMap.Login} exact element={<Login setUserData={setUserData}/>} />
        <Route path={RouteMap.LandingPage} exact element={<LandingPage userData={userData} />} />
        <Route path={RouteMap.Dashboard} exact element={<Dashboard userData={userData} />} />
        <Route path={RouteMap.Callback} exact element={<ProcessToken/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AllRoutes;

/*
This keeps track of all the pages. To add a page, 
1. add its URL to the RouteMap.js file
2. Add it as --> <Route path={RouteMap.SomeURL} exact element={<Component />} /> inside the <Routes></Routes>
*/