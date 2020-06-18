import React from "react";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";

import useStyles from "./styles";

function NotFound() {
  const clasess = useStyles();
  return (
    <Container maxWidth="xs">
      <Paper className={clasess.paper}>
        <Typography variant="subtitle1">Halaman Tidak Ditemukan</Typography>
        <Typography variant="h4">404</Typography>
        <Typography component={Link} to="/">
          Ayo Kembali
        </Typography>
      </Paper>
    </Container>
  );
}

export default NotFound;
