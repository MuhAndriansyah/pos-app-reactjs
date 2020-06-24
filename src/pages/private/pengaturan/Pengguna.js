import React, { useRef, useState } from "react";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { useFirebase } from "../../../components/FirebaseProvider";
import useStyles from "./styles/Pengguna";
import { useSnackbar } from "notistack";
import isEmail from "validator/lib/isEmail";

export default function Pengguna() {
  const clasess = useStyles();

  const { user } = useFirebase();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState({
    displayName: "",
    email: "",
    password: "",
  });

  const displayNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const saveDisplayName = async (e) => {
    const displayName = displayNameRef.current.value;

    if (!displayName) {
      setError({
        displayName: "Nama Wajib diisi",
      });
    } else if (displayName !== user.displayName) {
      setError({
        displayName: "",
      });
      setSubmitting(true);
      await user.updateProfile({ displayName });
      setSubmitting(false);
      enqueueSnackbar("Data nerhasil diperbarui", { variant: "success" });
    }
  };

  const updateEmail = async (e) => {
    const email = emailRef.current.value;

    if (!email) {
      setError({
        email: "Email wajib diisi",
      });
    } else if (!isEmail(email)) {
      setError({
        email: "Email tidak valid!",
      });
    } else if (email !== user.email) {
      setError({
        email: "",
      });
      setSubmitting(true);
      try {
        await user.updateEmail(email);
        enqueueSnackbar("Email berhasil diperbarui", { variant: "success" });
      } catch (error) {
        let emailError = "";
        switch (error.code) {
          case "auth/email-already-in-use":
            emailError = "Email telah digunakan oleh pengguna lain";
            break;
          case "auth/invalid-email":
            emailError = "Email tidak valid";
            break;
          case "auth/requires-recent-login":
            emailError = "Silahkan login kembali";
            break;
          default:
            emailError = "Terjadi Kesalahan silahkan coba kembali";
            break;
        }
        setError({
          email: emailError,
        });
      }
      setSubmitting(false);
    }
  };

  const sendEmailVerification = async (e) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
    };
    setSubmitting(true);
    await user.sendEmailVerification(actionCodeSettings);
    enqueueSnackbar("Email verifikasi telah dikirim", { variant: "success" });
    setSubmitting(false);
  };

  const updatePassword = async (e) => {
    const password = passwordRef.current.value;

    if (!password) {
      setError({
        password: "Password wajib diisi!",
      });
    } else {
      setSubmitting(true);
      try {
        await user.updatePassword(password);
        enqueueSnackbar("Password telah diperbarui", { variant: "success" });
      } catch (error) {
        let passwordError = "";

        switch (error.code) {
          case "auth/weak-password":
            passwordError = "Password terlalu lemah";
            break;
          case "auth/requires-recent-login":
            passwordError =
              "Silahkan login kembali untuk memperbaruhi password";
            break;
          default:
            passwordError = "Terjadi kesalahan silahkan coba lagi kembali";
            break;
        }
        setError({
          password: passwordError,
        });
      }
      setSubmitting(false);
    }
  };
  return (
    <div className={clasess.formPengguna}>
      <TextField
        id="displayName"
        name="displayName"
        label="Name"
        margin="normal"
        defaultValue={user.displayName}
        inputProps={{
          ref: displayNameRef,
          onBlur: saveDisplayName,
        }}
        disabled={isSubmitting}
        helperText={error.displayName}
        error={error.displayName ? true : false}
      />
      <TextField
        id="email"
        name="email"
        label="Email"
        margin="normal"
        defaultValue={user.email}
        inputProps={{
          ref: emailRef,
          onBlur: updateEmail,
        }}
        disabled={isSubmitting}
        helperText={error.email}
        error={error.email ? true : false}
      />

      {user.emailVerified ? (
        <Typography color="primary" variant="subtitle1">
          Email Telah Diverifikasi
        </Typography>
      ) : (
        <Button
          variant="outlined"
          onClick={sendEmailVerification}
          disabled={isSubmitting}
        >
          Kirim Verifikasi Email
        </Button>
      )}

      <TextField
        id="password"
        name="password"
        label="Password baru"
        margin="normal"
        type="password"
        autoComplete="new-password"
        inputProps={{
          ref: passwordRef,
          onBlur: updatePassword,
        }}
        disabled={isSubmitting}
        helperText={error.password}
        error={error.password ? true : false}
      />
    </div>
  );
}
