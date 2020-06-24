import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import { Switch, Route, Redirect } from "react-router-dom";
import Pengguna from "./Pengguna";
import Toko from "./Toko";
import useStyles from "./styles/index";

function Pengaturan(props) {
  const clasess = useStyles();
  const { location, history } = props;

  const handleChange = (event, value) => {
    history.push(value);
  };
  return (
    <Paper square className={clasess.tabContent}>
      <Tabs
        value={location.pathname}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
      >
        <Tab label="Pengguna" value="/pengaturan/pengguna" />
        <Tab label="Toko" value="/pengaturan/toko" />
      </Tabs>
      <Switch>
        <Route path="/pengaturan/pengguna" component={Pengguna} />
        <Route path="/pengaturan/toko" component={Toko} />
        <Redirect to="/pengaturan/pengguna" />
      </Switch>
    </Paper>
  );
}

export default Pengaturan;
