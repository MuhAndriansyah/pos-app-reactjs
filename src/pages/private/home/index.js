import React from "react";
import { useFirebase } from "../../../components/FirebaseProvider";
import Button from "@material-ui/core/Button";

export default function Home() {
  const { auth } = useFirebase();
  return (
    <>
      <h1>Halaman Home Private</h1>
      <Button
        onClick={(e) => {
          auth.signOut();
        }}
      >
        Log Out
      </Button>
    </>
  );
}
