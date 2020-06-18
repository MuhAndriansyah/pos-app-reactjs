import React, { useState } from "react";
// Material Ui
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import useStyle from "./styles";

// Router
import { Link as RouterLink, Redirect } from "react-router-dom";
// validator
import isEmail from "validator/lib/isEmail";
// Firebase Hook
import { useFirebase } from "../../components/FirebaseProvider";
// App Loading
import AppLoading from "../../components/AppLoading";

import { useSnackbar } from "notistack";

function LupaPassword() {
  const classes = useStyle();
  const [form, setForm] = useState({
    email: "",
  });

  const [error, setError] = useState({
    email: "",
  });

  const [isSubmitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: "" });
  };

  const { auth, user, loading } = useFirebase();

  const { enqueueSnackbar } = useSnackbar();
  const validate = () => {
    const newError = { ...error };

    if (!form.email) {
      newError.email = "Email tidak ditemukan";
    } else if (!isEmail(form.email)) {
      newError.email = "Email Tidak Valid!";
    }

    return newError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const findErrors = validate();

    if (Object.values(findErrors).some((err) => err !== "")) {
      setError(findErrors);
    } else {
      try {
        setSubmitting(true);
        const actionCodeSettings = {
          url: `${window.location.origin}/login`,
        };
        await auth.sendPasswordResetEmail(form.email, actionCodeSettings);
        enqueueSnackbar(`Email reset password telah dikirim`, {
          variant: "success",
        });
        setSubmitting(false);
      } catch (error) {
        const newError = {};

        switch (error.code) {
          case "auth/invalid-email":
            newError.email = "Email tidak valid";
            break;
          case "auth/user-not-found":
            newError.email = "Email tidak terdaftar";
            break;
          default:
            newError.email = "Terjadi Kesalahan";
            break;
        }
        setError(newError);
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return <AppLoading />;
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <Container maxWidth="xs">
      <Paper className={classes.paper}>
        <Typography variant="h5" component="h1" className={classes.title}>
          Lupa Password
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            id="email"
            type="email"
            name="email"
            label="Alamat Email"
            margin="normal"
            fullWidth
            required
            value={form.email || ""}
            onChange={handleChange}
            helperText={error.email}
            error={error.email ? true : false}
            disabled={isSubmitting}
          />

          <Button
            disabled={isSubmitting}
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            Kirim
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
export default LupaPassword;
