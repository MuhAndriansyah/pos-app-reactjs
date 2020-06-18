import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  button: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    border: 0,
    borderRadius: 3,
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "white",
    height: 48,
    padding: "0 30px",
  },
  paper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(6),
  },
  title: {
    textAlign: "center",
    marginBottom: theme.spacing(3),
  },
  link: {
    marginTop: theme.spacing(1),
  },
}));

export default useStyles;
