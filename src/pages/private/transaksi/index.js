import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import ViewIcon from "@material-ui/icons/Visibility";
import DeleteIcon from "@material-ui/icons/Delete";
import { useCollection } from "react-firebase-hooks/firestore";
import { useFirebase } from "../../../components/FirebaseProvider";

import { currency } from "../../../utils/Formatter";
import AppPageLoading from "../../../components/AppPageLoading";
import format from "date-fns/format";
import useStyles from "./styles";
import DetailsDialog from "./details";

export default function Transaksi() {
  const { firestore, user } = useFirebase();
  const classes = useStyles();
  const transaksiCol = firestore.collection(`toko/${user.uid}/transaksi`);

  const [snapshot, loading] = useCollection(transaksiCol);
  const [transaksiItems, setTransakiItems] = useState([]);
  const [details, setDetails] = useState({
    open: false,
    transaksi: {},
  });

  useEffect(() => {
    if (snapshot) {
      setTransakiItems(snapshot.docs);
    }
  }, [snapshot]);

  if (loading) {
    return <AppPageLoading />;
  }

  const handleDelete = (transaksiDoc) => async (e) => {
    if (window.confirm("Apakah anda yakin ingin menghapus transaksi ini")) {
      await transaksiDoc.ref.delete();
    }
  };

  const handleCloseDetails = (e) => {
    setDetails({
      open: false,
      transaksi: {},
    });
  };

  const openHandleDetails = (transaksiDoc) => (e) => {
    setDetails({
      open: true,
      transaksi: transaksiDoc.data(),
    });
  };

  return (
    <>
      <Typography variant="h4" paragraph>
        Daftar Transaksi
      </Typography>
      {transaksiItems.length <= 0 && (
        <Typography>Belum ada transaksi</Typography>
      )}
      <Grid container spacing={5}>
        {transaksiItems.map((transaksiDoc) => {
          const transaksiData = transaksiDoc.data();
          return (
            <Grid key={transaksiDoc.id} item xs={12} sm={12} md={6} lg={4}>
              <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                  <Typography variant="h5" noWrap>
                    {transaksiData.no}
                  </Typography>
                  <Typography>
                    Total: {currency(transaksiData.total)}
                  </Typography>
                  <Typography>
                    Tanggal:
                    {format(
                      new Date(transaksiData.timestamp),
                      "dd-MM-yyyy HH:mm"
                    )}
                  </Typography>
                </CardContent>
                <CardActions className={classes.actionIcon}>
                  <IconButton onClick={openHandleDetails(transaksiDoc)}>
                    <ViewIcon />
                  </IconButton>
                  <IconButton>
                    <DeleteIcon onClick={handleDelete(transaksiDoc)} />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <DetailsDialog
        open={details.open}
        handleClose={handleCloseDetails}
        transaksi={details.transaksi}
      ></DetailsDialog>
    </>
  );
}
