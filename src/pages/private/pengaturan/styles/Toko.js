import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  formToko: {
    display: "flex",
    flexDirection: "column",
    width: 300,
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

export default useStyles;
