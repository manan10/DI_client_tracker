import React from "react";
import Navbar from "../components/Shared/Navbar";
import Settings from "../../../shared/pages/Settings";

const ClientSettings = () => {
  return <Settings mode="client" hideTopBar={true} navbar={<Navbar />} />;
};

export default ClientSettings;