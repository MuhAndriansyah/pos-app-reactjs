import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  card: {
    display: "flex",
  },

  cardContent: {
    flex: "2 0 auto",
  },

  actionIcon: {
    flexDirection: "column",
  },
}));

export default useStyles;
