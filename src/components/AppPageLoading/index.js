import React from "react";

import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";

import useStyles from "./styles";

function AppPageLoading() {
  const classes = useStyles();
  return (
    <Container maxWidth="xs">
      <div className={classes.loadingBox}>
        <CircularProgress />
      </div>
    </Container>
  );
}

export default AppPageLoading;
