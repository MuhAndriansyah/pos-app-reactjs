import React, { useState } from "react";
// Material-ui
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

function Registrasi() {
  const classes = useStyle();

  const [form, setForm] = useState({
    email: "",
    passowrd: "",
    ulangi_password: "",
  });

  const [error, setError] = useState({
    email: "",
    password: "",
    ulangi_password: "",
  });

  const [isSubmitting, setSubmitting] = useState(false);

  const { auth, user, loading } = useFirebase();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: "" });
  };

  const validate = () => {
    const newError = { ...error };

    if (!form.email) {
      newError.email = "Email harus diisi!";
    } else if (!isEmail(form.email)) {
      newError.email = "Email tidak valid";
    }

    if (!form.password) {
      newError.password = "Password harus diisi!";
    }

    if (!form.ulangi_password) {
      newError.ulangi_password = "Ulangi password harus diisi!";
    } else if (form.ulangi_password !== form.password) {
      newError.ulangi_password = "Password Tidak Sama";
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
        await auth.createUserWithEmailAndPassword(form.email, form.password);
      } catch (e) {
        const newError = {};

        switch (e.code) {
          case "auth/email-already-in-use":
            newError.email = "Email sudah terdaftar";
            break;
          case "auth/invalid-email":
            newError.email = "Email tidak valid";
            break;
          case "auth/weak-password":
            newError.password = "Password lemah";
            break;
          case "auth/operation-not-allowed":
            newError.email = "Metode email dan password tidak didukung";
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
          Buat Akun Baru
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
            value={form.email}
            onChange={handleChange}
            helperText={error.email}
            error={error.email ? true : false}
            disabled={isSubmitting}
          />
          <TextField
            required
            id="password"
            type="password"
            name="password"
            label="Password"
            margin="normal"
            fullWidth
            value={form.password}
            onChange={handleChange}
            helperText={error.password}
            error={error.password ? true : false}
            disabled={isSubmitting}
          />
          <TextField
            id="ulangi_password"
            type="password"
            name="ulangi_password"
            label="Ulangi Password"
            margin="normal"
            fullWidth
            required
            value={form.ulangi_password}
            onChange={handleChange}
            helperText={error.ulangi_password}
            error={error.ulangi_password ? true : false}
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
            Daftar
          </Button>
          <Typography className={classes.link}>
            Sudah Punya Akun?
            <Link component={RouterLink} to="/login">
              Silahkan Login
            </Link>
          </Typography>
        </form>
      </Paper>
    </Container>
  );
}

export default Registrasi;
