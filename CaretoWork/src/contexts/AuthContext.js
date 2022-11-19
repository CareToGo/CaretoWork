import { createContext, useContext, useEffect, useState } from "react";
import { Auth, DataStore } from "aws-amplify";
import { Worker } from "../models";

const AuthContext = createContext({});

const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [dbWorker, setDbWorker] = useState(null);
  const [sub, setSub] = useState(null);

  const fetchsub = async () => {
    Auth.currentAuthenticatedUser()
      .then((results) => {
        setSub(results.attributes.sub);
        setAuthUser(results);
        queryWorker(results.attributes.sub);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const queryWorker = async (arg) => {
    const subscription = DataStore.observeQuery(Worker, (worker) =>
      worker.sub("eq", arg)
    ).subscribe((snapshot) => {
      const { items } = snapshot;
      setDbWorker(items[0]);
    });
  };

  useEffect(() => {
    fetchsub();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, dbWorker, sub, setDbWorker }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;

export const useAuthContext = () => useContext(AuthContext);
