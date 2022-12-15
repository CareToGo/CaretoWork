import { createContext, useContext, useEffect, useState } from "react";
import { Storage, DataStore } from "aws-amplify";
import { Worker, User, Order } from "../models";
import { useAuthContext } from "./AuthContext";

const OrderContext = createContext({});

const OrderContextProvider = ({ children }) => {
  const { dbWorker } = useAuthContext();
  const [orders, setOrders] = useState(null);
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [userImage, setUserImage] = useState(null);

  const fetchOrder = async (id) => {
    if (!id) {
      setOrder(null);
      return;
    }
    const fetchedOrder = await DataStore.query(Order, id);

    const fetchedUser = await DataStore.query(User, fetchedOrder.userID);
    Storage.get(`${fetchedUser.sub}.jpg`)
      .then((mylink) => setUserImage(mylink))
      .catch((e) => console.log(e));

    setOrder(fetchedOrder);
    setUser(fetchedUser);
  };

  useEffect(() => {
    if (!order) {
      return;
    }
    const subscription = DataStore.observe(Order, order.id).subscribe(
      ({ opType, element }) => {
        if (opType === "UPDATE") {
          fetchOrder(element.id);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [order?.id]);

  const acceptOrder = () => {
    DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.status = "ACCEPTED";
        updated.Worker = dbWorker;
      })
    ).then(setOrders);
  };
  const arrivedOrder = () => {
    DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.status = "ARRIVED";
        updated.Worker = dbWorker;
      })
    ).then(setOrders);
  };

  const completeOrder = () => {
    DataStore.save(
      Order.copyOf(order, (updated) => {
        updated.status = "COMPLETED";
        updated.Worker = dbWorker;
      })
    ).then(setOrders);
  };

  return (
    <OrderContext.Provider
      value={{
        acceptOrder,
        order,
        fetchOrder,
        user,
        arrivedOrder,
        completeOrder,
        userImage,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContextProvider;

export const useOrderContext = () => useContext(OrderContext);
