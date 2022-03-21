import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import RouteMap from "./RouteMap";

import React, { useState } from 'react';

import Login from "./pages/auth/Login";
import LandingPage from "./pages/dashboard/LandingPage";
import Dashboard from "./pages/dashboard/Dashboard"
import Error_404 from "./pages/Error_404";
import { ProcessToken } from "./pages/auth/ProcessToken";

function AllRoutes() {
  const [userData, setUserData] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path={RouteMap.Login} exact element={<Login setUserData={setUserData} />} />
        <Route path={RouteMap.LandingPage} exact element={<LandingPage userData={userData} />} />
        <Route path={RouteMap.Dashboard} exact element={<Dashboard userData={userData} />} />
        <Route path={RouteMap.Callback} exact element={<ProcessToken />} />
        <Route path={RouteMap.Error_404} exact element={<Error_404 />} userData={userData} />

        <Route path="*" element={<Navigate to={RouteMap.Error_404} />} />
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