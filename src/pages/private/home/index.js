import React, { useState, useEffect } from "react";
import { useFirebase } from "../../../components/FirebaseProvider";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListSubheader from "@material-ui/core/ListSubheader";
import Avatar from "@material-ui/core/Avatar";
import ImageIcon from "@material-ui/icons/Image";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import Button from "@material-ui/core/Button";
import { useCollection } from "react-firebase-hooks/firestore";
import AppPageLoading from "../../../components/AppPageLoading";
import { useSnackbar } from "notistack";
import { currency } from "../../../utils/Formater";
import format from "date-fns/format";
import useStyles from "./styles";
import SaveIcon from "@material-ui/icons/Save";

function Home() {
  const { firestore, user } = useFirebase();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const todayDateString = format(new Date(), "yyyy-MM-dd");
  //Produk collection reference
  const produkCol = firestore.collection(`toko/${user.uid}/produk`);

  // Transaksi Collection reference
  const transaksiCol = firestore.collection(`toko/${user.uid}/transaksi`);

  const [snapshotProduk, loadingProduk] = useCollection(produkCol);
  const [snapshotTransaksi, loadingTransaksi] = useCollection(
    transaksiCol.where("tanggal", "==", todayDateString)
  );

  const initialState = {
    no: "",
    items: {},
    total: 0,
    tanggal: todayDateString,
  };

  const [produkItems, setProdukItems] = useState([]);
  const [filterProduk, setFilterProduk] = useState("");
  const [transaksi, setTransaksi] = useState(initialState);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (snapshotTransaksi) {
      setTransaksi((transaksi) => ({
        ...transaksi,
        no: `${transaksi.tanggal}/${snapshotTransaksi.docs.length}`,
      }));
    } else {
      setTransaksi((transaksi) => ({
        ...transaksi,
        no: `${transaksi.tanggal}/1`,
      }));
    }
  }, [snapshotTransaksi]);

  // Data produk
  useEffect(() => {
    if (snapshotProduk) {
      setProdukItems(
        snapshotProduk.docs.filter((produkDoc) => {
          if (filterProduk) {
            return produkDoc
              .data()
              .nama.toLowerCase()
              .includes(filterProduk.toLowerCase());
          }
          return true;
        })
      );
    }
  }, [snapshotProduk, filterProduk]);

  const addItem = (produkDoc) => (e) => {
    //global data transaksi item berdasarkan produk id
    let newItem = { ...transaksi.items[produkDoc.id] };
    console.log(newItem);
    const produkData = produkDoc.data();

    if (newItem.jumlah) {
      newItem.jumlah = newItem.jumlah + 1;
      newItem.subtotal = produkData.harga * newItem.jumlah;
    } else {
      newItem.jumlah = 1;
      newItem.harga = produkData.harga;
      newItem.subtotal = produkData.harga;
      newItem.nama = produkData.nama;
    }

    const newItems = {
      ...transaksi.items,
      [produkDoc.id]: newItem,
    };

    console.log(newItems);

    if (newItem.jumlah > produkData.stok) {
      enqueueSnackbar("Jumlah melebihi stok", { variant: "error" });
    } else {
      setTransaksi({
        ...transaksi,
        items: newItems,
        total: Object.keys(newItems).reduce((total, keyItem) => {
          const item = newItems[keyItem];
          return total + parseInt(item.subtotal);
        }, 0),
      });
    }
  };

  const handleChangeJumlah = (itemKey) => (e) => {
    let newItem = { ...transaksi.items[itemKey] };
    console.log(newItem);
    newItem.jumlah = parseInt(e.target.value);
    newItem.subtotal = newItem.harga * newItem.jumlah;

    const newItems = {
      ...transaksi.items,
      [itemKey]: newItem,
    };

    const produkDoc = produkItems.find((item) => item.id === itemKey);
    const produkData = produkDoc.data();
    if (newItem.jumlah > produkData.stok) {
      enqueueSnackbar("Jumlah melebihi stok", { variant: "error" });
    } else {
      setTransaksi({
        ...transaksi,
        items: newItems,
        total: Object.keys(newItems).reduce((total, keyItem) => {
          const item = newItems[keyItem];
          return total + parseInt(item.subtotal);
        }, 0),
      });
    }
  };

  if (loadingProduk || loadingTransaksi) {
    return <AppPageLoading />;
  }

  const simpanTransaksi = async (e) => {
    if (Object.keys(transaksi.items).length <= 0) {
      enqueueSnackbar("Tidak ada transaksi", { variant: "error" });
    }
    setSubmitting(true);
    try {
      await transaksiCol.add({
        ...transaksi,
        timestamp: Date.now(),
      });
      // Update stok
      await firestore.runTransaction((transaction) => {
        // Akan Mengambil id item transaksi pada transaksi items
        const produkIDs = Object.keys(transaksi.items);
        console.log("Id", produkIDs);
        return Promise.all(
          produkIDs.map((produkId) => {
            const produkRef = firestore.doc(
              `toko/${user.uid}/produk/${produkId}`
            );

            return transaction.get(produkRef).then((produkDoc) => {
              if (!produkDoc.exists) {
                throw Error("Produk tidak ada");
              }

              let newStok =
                parseInt(produkDoc.data().stok) -
                parseInt(transaksi.items[produkId].jumlah);

              if (newStok < 0) {
                newStok = 0;
              }

              transaction.update(produkRef, { stok: newStok });
            });
          })
        );
      });

      enqueueSnackbar("Transaksi berhasil disimpan", { variant: "success" });
      setTransaksi((transaksi) => ({
        ...initialState,
        no: transaksi.no,
      }));
    } catch (e) {
      enqueueSnackbar(e.message, { variant: "error" });
    }
    setSubmitting(false);
  };
  return (
    <>
      <Typography variant="h4" paragraph>
        Buat Transaksi Baru
      </Typography>
      <Grid container spacing={5}>
        <Grid item xs>
          <TextField
            label="Nomor Transaksi"
            value={transaksi.no}
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={simpanTransaksi}
            disabled={isSubmitting}
          >
            <SaveIcon className={classes.iconLeft} />
            Simpan Transaksi
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={5}>
        <Grid item xs={12} md={8}>
          <Table>
            <TableHead>
              <TableCell>Item</TableCell>
              <TableCell>Jumlah</TableCell>
              <TableCell>Harga</TableCell>
              <TableCell>Subtotal</TableCell>
            </TableHead>
            <TableBody>
              {Object.keys(transaksi.items).map((itemKey) => {
                const item = transaksi.items[itemKey];
                return (
                  <TableRow key={itemKey}>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>
                      <TextField
                        className={classes.inputJumlah}
                        value={item.jumlah}
                        type="number"
                        onChange={handleChangeJumlah(itemKey)}
                        InputProps={{ inputProps: { min: 1 } }}
                      ></TextField>
                    </TableCell>
                    <TableCell>{currency(item.harga)}</TableCell>
                    <TableCell>{currency(item.subtotal)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography>Total</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h5">
                    {currency(transaksi.total)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
        <Grid item xs={12} md={4}>
          <List
            className={classes.produkList}
            component="nav"
            subheader={
              <ListSubheader component="div">
                <TextField
                  label="Cari Produk"
                  fullWidth
                  margin="normal"
                  autoFocus
                  onChange={(e) => setFilterProduk(e.target.value)}
                />
              </ListSubheader>
            }
          >
            {produkItems.map((produkDoc) => {
              const produkData = produkDoc.data();
              return (
                <ListItem
                  key={produkDoc.id}
                  button
                  disabled={!produkData.stok || isSubmitting}
                  onClick={addItem(produkDoc)}
                >
                  {produkData.foto ? (
                    <ListItemAvatar>
                      <Avatar src={produkData.foto} alt={produkData.nama} />
                    </ListItemAvatar>
                  ) : (
                    <ListItemIcon>
                      <ImageIcon />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={produkData.nama}
                    secondary={`Stok: ${produkData.stok || 0}`}
                  />
                </ListItem>
              );
            })}
          </List>
        </Grid>
      </Grid>
    </>
  );
}

export default Home;
