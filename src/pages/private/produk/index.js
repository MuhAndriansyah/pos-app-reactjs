import React from "react";
import { Switch, Route } from "react-router-dom";
import EditProduk from "./Edit";
import GridProduk from "./Grid";

function Produk() {
  return (
    <Switch>
      <Route path="/produk/edit/:produkId" component={EditProduk} />
      <Route path="/produk" component={GridProduk} />
    </Switch>
  );
}

export default Produk;
