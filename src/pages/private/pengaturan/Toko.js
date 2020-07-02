import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import isUrl from "validator/lib/isURL";
import useStyles from "./styles/Toko";
import { useFirebase } from "../../../components/FirebaseProvider";
import { useSnackbar } from "notistack";
import { useDocument } from "react-firebase-hooks/firestore";
import AppPageLoading from "../../../components/AppPageLoading";
import { Prompt } from "react-router-dom";

function Toko() {
  const clasess = useStyles();
  const { firestore, user } = useFirebase();
  const { enqueueSnackbar } = useSnackbar();
  const tokoDoc = firestore.doc(`toko/${user.uid}`);
  const [snapshot, loading] = useDocument(tokoDoc);
  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    telepon: "",
    website: "",
  });

  const [error, setError] = useState({
    nama: "",
    alamat: "",
    telepon: "",
    website: "",
  });
  const [isSomethingChange, setSomethingChange] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (snapshot) {
      setForm(snapshot.data());
    }
  }, [snapshot]);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError({
      ...error,
      [e.target.name]: "",
    });

    setSomethingChange(true);
  };

  if (loading) {
    return <AppPageLoading />;
  }

  const validate = () => {
    const newError = { ...error };

    if (!form.nama) {
      newError.nama = "Nama Toko wajib diisi!";
    }

    if (!form.alamat) {
      newError.alamat = "Alamat wajib diisi!";
    }

    if (!form.telepon) {
      newError.telepon = "Telpon wajib diisi!";
    }

    if (!form.website) {
      newError.website = "Website waji diisi!";
    } else if (!isUrl(form.website)) {
      newError.website = "Website tidak valid!";
    }

    return newError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const findErrors = validate();

    if (Object.values(findErrors).some((err) => err !== "")) {
      setError(findErrors);
    } else {
      setSubmitting(true);
      try {
        await tokoDoc.set(form, { merge: true });
        setSomethingChange(false);
        enqueueSnackbar("Data berhasil disimpan", { variant: "success" });
      } catch (error) {
        enqueueSnackbar(error.message, { variant: "error" });
      }
      setSubmitting(false);
    }
  };

  return (
    <div className={clasess.formToko}>
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          id="nama"
          name="nama"
          label="Nama Toko"
          margin="normal"
          value={form.nama}
          disabled={isSubmitting}
          helperText={error.nama}
          onChange={handleChange}
          error={error.nama ? true : false}
          required
          fullWidth
        />

        <TextField
          id="nama"
          name="alamat"
          label="Alamat"
          margin="normal"
          value={form.alamat}
          disabled={isSubmitting}
          helperText={error.alamat}
          onChange={handleChange}
          error={error.alamat ? true : false}
          required
          fullWidth
        />

        <TextField
          id="telepon"
          name="telepon"
          label="Nomor Telepon"
          value={form.telepon}
          margin="normal"
          disabled={isSubmitting}
          helperText={error.telepon}
          onChange={handleChange}
          error={error.telepon ? true : false}
          required
          fullWidth
        />
        <TextField
          id="website"
          name="website"
          label="Website Url"
          value={form.website}
          margin="normal"
          disabled={isSubmitting}
          helperText={error.website}
          onChange={handleChange}
          error={error.website ? true : false}
          required
          fullWidth
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          className={clasess.button}
          disabled={isSubmitting || !isSomethingChange}
        >
          SIMPAN
        </Button>
      </form>
      <Prompt
        when={isSomethingChange}
        message="Perubahan data belum disimpan, apakah anda yakin ingin meninggalkan halaman ini?"
      />
    </div>
  );
}

export default Toko;
