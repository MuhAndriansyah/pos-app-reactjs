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
import { useCollection } from "react-firebase-hooks/firestore";
import AppPageLoading from "../../../components/AppPageLoading";
import useStyles from "./styles";
function Home() {
  const { firestore, user } = useFirebase();
  const classes = useStyles();
  //Produk collection reference
  const produkCol = firestore.collection(`toko/${user.uid}/produk`);

  const [snapshot, loading] = useCollection(produkCol);

  const [produkItems, setProdukItems] = useState([]);
  const [filterProduk, setFilterProduk] = useState("");

  useEffect(() => {
    if (snapshot) {
      setProdukItems(
        snapshot.docs.filter((produkDoc) => {
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
  }, [snapshot, filterProduk]);

  if (loading) {
    return <AppPageLoading />;
  }

  return (
    <>
      <Typography variant="h2" paragraph>
        Home
      </Typography>
      <Grid container>
        <Grid item xs={12}>
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
                <ListItem key={produkDoc.id} button disabled={!produkData.stok}>
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
