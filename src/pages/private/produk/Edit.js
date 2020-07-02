import React, { useState, useEffect } from "react";

// Material Ui
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import UploadIcon from "@material-ui/icons/CloudUpload";
import SaveIcon from "@material-ui/icons/Save";
import { useFirebase } from "../../../components/FirebaseProvider";
import { useDocument } from "react-firebase-hooks/firestore";
import AppPageLoading from "../../../components/AppPageLoading";
import { useSnackbar } from "notistack";
import useStyles from "./styles/Edit";
import { Prompt } from "react-router-dom";

function EditProduk({ match }) {
  const clasess = useStyles();
  const { firestore, user, storage } = useFirebase();
  const { enqueueSnackbar } = useSnackbar();
  const produkDoc = firestore.doc(
    `toko/${user.uid}/produk/${match.params.produkId}`
  );

  const produkStorageRef = storage.ref(`toko/${user.uid}/produk`);

  const [snapshot, loading] = useDocument(produkDoc);

  const [form, setForm] = useState({
    nama: "",
    harga: 0,
    sku: "",
    stok: 0,
    deskripsi: "",
  });

  const [error, setError] = useState({
    nama: "",
    harga: "",
    stok: "",
  });

  const [isSubmitting, setSubmitting] = useState(false);
  const [somethingChange, setSomethingChange] = useState(false);
  useEffect(() => {
    if (snapshot) {
      setForm((currentForm) => ({
        ...currentForm,
        ...snapshot.data(),
      }));
    }
  }, [snapshot]);

  const validate = () => {
    const newError = { ...error };

    if (!form.nama) {
      newError.nama = "Nama Produk wajib diisi!";
    }

    if (!form.harga) {
      newError.harga = "Harga Produk wajib diisi!";
    }

    if (!form.stok) {
      newError.stok = "Stok Produk wajib diisi!";
    }

    return newError;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const findErrors = validate();

    if (Object.values(findErrors).some((err) => err !== "")) {
      setError(findErrors);
    } else {
      setSubmitting(true);
      try {
        await produkDoc.set(form, { merge: true });
        enqueueSnackbar("Data produk berhasil disimpan", {
          variant: "success",
        });
        setSomethingChange(false);
      } catch (error) {
        enqueueSnackbar(error.message, { variant: "error" });
      }
      setSubmitting(false);
    }
  };

  const handleUploadFile = async (e) => {
    // Akses file yang upload
    const file = e.target.files[0];
    // Validasi file yang diupload
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError((error) => ({
        ...error,
        foto: `Tipe file tidak didukung: ${file.type}`,
      }));
    } else if (file.size >= 512000) {
      setError((error) => ({
        ...error,
        foto: `Ukuran file terlalu besar > 500KB`,
      }));
    } else {
      // Baca File yang diupload dengan FileReade API
      const reader = new FileReader();
      // Jalankan beberapa event
      reader.onabort = () => {
        setError((error) => ({
          ...error,
          foto: `Proses pembacaan file dibatalkan`,
        }));
      };

      reader.onerror = () => {
        setError((error) => ({
          ...error,
          foto: "File tidak bisa dibaca",
        }));
      };
      // Jika event berhasil terbaca maka proses akan berlangsung
      reader.onload = async () => {
        setError((error) => ({
          ...error,
          foto: "",
        }));
        setSubmitting(true);

        try {
          // Mmebuat child reference menggunakan nama file dan extension
          //Extension File
          const fotoExt = file.name.substring(file.name.lastIndexOf("."));
          //Nama File
          const fotoRef = produkStorageRef.child(
            `${match.params.produkId}${fotoExt}`
          );
          console.log("fotoRef", fotoRef);
          // File yang akan diupload
          const fotoSnapshot = await fotoRef.putString(
            reader.result,
            "data_url"
          );
          // Data gambar yang akan diakses/ditampilkan
          const fotoUrl = await fotoSnapshot.ref.getDownloadURL();

          setForm((currentForm) => ({
            ...currentForm,
            foto: fotoUrl,
          }));

          setSomethingChange(true);
        } catch (e) {
          setError((error) => ({
            ...error,
            foto: e.message,
          }));
        }

        setSubmitting(false);
      };

      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <AppPageLoading />;
  }

  return (
    <div>
      <Typography variant="h5" component="h1">
        Edit Produk: {form.nama}
      </Typography>
      <Grid container alignItems="center" justify="center">
        <Grid item xs={12} sm={6}>
          <form id="form-produk" onSubmit={handleSubmit} noValidate>
            <TextField
              id="nama"
              name="nama"
              label="Nama Produk"
              margin="normal"
              fullWidth
              required
              value={form.nama}
              onChange={handleChange}
              helperText={error.nama}
              error={error.nama ? true : false}
              disabled={isSubmitting}
            />
            <TextField
              id="sku"
              name="sku"
              label="SKU Produk"
              margin="normal"
              fullWidth
              value={form.sku}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <TextField
              id="harga"
              name="harga"
              label="Harga Produk"
              type="number"
              margin="normal"
              required
              fullWidth
              value={form.harga}
              onChange={handleChange}
              helperText={error.harga}
              error={error.harga ? true : false}
              disabled={isSubmitting}
            />
            <TextField
              id="stok"
              name="stok"
              label="Stok Produk"
              type="number"
              margin="normal"
              required
              fullWidth
              value={form.stok}
              onChange={handleChange}
              helperText={error.stok}
              error={error.stok ? true : false}
              disabled={isSubmitting}
            />
            <TextField
              id="deskripsi"
              name="deskripsi"
              label="Deskripsi Produk"
              margin="normal"
              multiline
              rowsMax={3}
              fullWidth
              value={form.deskripsi}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </form>
        </Grid>

        <Grid item xs={12} sm={6}>
          <div className={clasess.uploadFotoProduk}>
            {form.foto && (
              <img
                src={form.foto}
                alt={`Foto produk ${form.nama}`}
                className={clasess.previewFotoProduk}
              />
            )}
            <input
              className={clasess.hideInputFile}
              id="upload-foto-produk"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleUploadFile}
            />
            <label htmlFor="upload-foto-produk">
              <Button
                variant="outlined"
                component="span"
                disabled={isSubmitting}
              >
                <UploadIcon className={clasess.iconRight} />
                Upload Photo Produk
              </Button>
            </label>
            {error.foto && <Typography color="error">{error.foto} </Typography>}
          </div>
        </Grid>
        <Grid item xs={12}>
          <Button
            color="primary"
            variant="contained"
            form="form-produk"
            type="submit"
            disabled={isSubmitting || !somethingChange}
          >
            <SaveIcon className={clasess.iconRight} />
            Simpan
          </Button>
        </Grid>
      </Grid>
      <Prompt
        when={somethingChange}
        message="Terdapat perubahan data yang belum disimpan, apakah anda yakin ingin menginggalkan halaman ini"
      />
    </div>
  );
}

export default EditProduk;
