import React from "react";
import SidebarContext from "./components/Sidebar/context";
import ViewEquipments from "./components/equipments/ViewEquipments";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import {
  PATH_ANALYTICS,
  PATH_EQUIPMENTS,
  PATH_MONITORING,
} from "./components/Sidebar/paths";

function App() {
  return (
    <Router>
      <SidebarContext>
        <Routes>
          <Route path={"/"} element={<></>} />
          <Route path={PATH_EQUIPMENTS} element={<ViewEquipments />} />
          <Route path={PATH_MONITORING} element={<ViewEquipments />} />
          <Route path={PATH_ANALYTICS} element={<ViewEquipments />} />
        </Routes>
      </SidebarContext>
    </Router>
  );
}

export default App;
