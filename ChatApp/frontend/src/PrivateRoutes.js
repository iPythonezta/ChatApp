import React from 'react';
import { Route, Navigate,Outlet } from 'react-router-dom';

const PrivateRoute = ({isLoggedIn}) => (
  
  isLoggedIn ? (
      <Outlet /> 
  ) : (
     <Navigate to={'/login'} />
  )
);

export default PrivateRoute;