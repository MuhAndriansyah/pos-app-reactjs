import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { currency } from "../../../utils/Formatter";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function DetailsDialog({ open, handleClose, transaksi }) {
  console.log(transaksi);
  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          Transaksi : {transaksi.no}
        </DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableCell>Item</TableCell>
              <TableCell>Jumlah</TableCell>
              <TableCell>Harga</TableCell>
              <TableCell>Subtotal</TableCell>
            </TableHead>
            <TableBody>
              {transaksi.items &&
                Object.keys(transaksi.items).map((k) => {
                  const item = transaksi.items[k];
                  return (
                    <TableRow key={k}>
                      <TableCell>{item.nama}</TableCell>
                      <TableCell>{item.jumlah}</TableCell>
                      <TableCell>{currency(item.harga)}</TableCell>
                      <TableCell>{currency(item.subtotal)}</TableCell>
                    </TableRow>
                  );
                })}

              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="subtitle2">Total</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6">
                    {currency(transaksi.total)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

DetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  transaksi: PropTypes.object.isRequired,
};

export default DetailsDialog;
