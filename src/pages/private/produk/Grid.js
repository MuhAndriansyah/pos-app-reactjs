import React, { useState, useEffect } from "react";
import AddDialogProduk from "./AddDialogProduk";
import { useFirebase } from "../../../components/FirebaseProvider";
import { useCollection } from "react-firebase-hooks/firestore";
import AppPageLoading from "../../../components/AppPageLoading";
import { currency } from "../../../utils/Formater";
import { Link } from "react-router-dom";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import useStyles from "./styles/GridStyles";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import ImageIcon from "@material-ui/icons/Image";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";

function GridProduk() {
  const classes = useStyles();

  const { firestore, user, storage } = useFirebase();

  //1.Get produk collection path reference
  const produkCol = firestore.collection(`toko/${user.uid}/produk`);

  // 2.Masukkan pada useCollection
  const [snapshot, loading] = useCollection(produkCol);

  //3. buat state variable produkItems dengan default array
  const [produkItems, setProdukItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  //4. Gunakan useEffect untuk memasukan data snapshot ke setProdukItems
  // snapshot.docs untuk menampilkan seluruh data array dokumen
  useEffect(() => {
    if (snapshot) {
      setProdukItems(snapshot.docs);
    }
  }, [snapshot]);

  if (loading) {
    return <AppPageLoading />;
  }

  const handleDelete = (produkDoc) => async (e) => {
    if (window.confirm("Anda yakin ingin menghapus produk in?")) {
      // Produk ref
      await produkDoc.ref.delete();
      const fotoUrl = produkDoc.data().foto;
      if (fotoUrl) {
        await storage.refFromURL(fotoUrl).delete();
      }
    }
  };

  return (
    <>
      <Typography variant="h5" paragraph>
        Daftar Produk
      </Typography>
      {produkItems.length < 0 && <Typography>Belum ada data produk</Typography>}

      <Grid container spacing={5}>
        {produkItems.map((produkDoc) => {
          const produkData = produkDoc.data();
          // console.log(produkDoc);
          // console.log(produkDoc.ref);
          // console.log("Produk", produkDoc.data());
          return (
            <Grid key={produkDoc.id} item={true} xs={12} sm={12} md={6} lg={4}>
              <Card className={classes.card}>
                {produkData.foto && (
                  <CardMedia
                    className={classes.media}
                    image={produkData.foto}
                    title={produkData.nama}
                  />
                )}
                {!produkData.foto && (
                  <div className={classes.fotoPlaceholder}>
                    <ImageIcon fontSize="large" color="disabled" />
                  </div>
                )}
                <CardContent>
                  <Typography variant="h5" noWrap>
                    {produkData.nama}
                  </Typography>
                  <Typography variant="subtitle1">
                    Harga: {currency(produkData.harga)}
                  </Typography>
                  <Typography>Stok: {produkData.stok}</Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    component={Link}
                    to={`/produk/edit/${produkDoc.id}`}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={handleDelete(produkDoc)}>
                    <DeleteIcon color="action" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Fab
        className={classes.fab}
        color="primary"
        onClick={(e) => {
          setOpenDialog(true);
        }}
      >
        <AddIcon />
      </Fab>
      <AddDialogProduk
        open={openDialog}
        handleClose={() => {
          setOpenDialog(false);
        }}
      />
    </>
  );
}

export default GridProduk;
