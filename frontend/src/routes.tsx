import React from "react";
import { Route, BrowserRouter } from "react-router-dom";

// import { Container } from './styles';

import Home from "./pages/Home";
import CreatePoint from "./pages/CreatePoint";

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <Route path="/" exact component={Home} />
      <Route path="/points/create" component={CreatePoint} />
    </BrowserRouter>
  );
};

export default Routes;
