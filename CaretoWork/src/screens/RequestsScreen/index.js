import { useRef, memo, useMemo, useCallback, useState, useEffect } from "react";
import {
  Text,
  View,
  Dimensions,
  useWindowDimensions,
  PermissionsAndroid,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FlatList } from "react-native-gesture-handler";
import srvcReqs from "../../../assets/data/service_reqs.json";
import SingleRequest from "../../components/SingleRequest";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { DataStore } from "aws-amplify";
import { Order } from "../../models";

const RequestsScreen = () => {
  const [orders, setOrders] = useState([]);
  const bottomSheetRef = useRef(null);
  const { height, width } = useWindowDimensions();
  const snapPoints = useMemo(() => [100, "85%"], []);

  const fetchOrder = async () => {
    const results = await DataStore.query(Order);
    setOrders(results);
    console.log(orders);
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  return (
    <GestureHandlerRootView style={{ backgroundColor: "lightblue", flex: 1 }}>
      <MapView
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}
        style={{ height, width }}
      >
        {orders.map((order) => (
          <Marker
            key={order.id}
            title={order.name}
            description={order.address}
            coordinate={{ latitude: order.lat, longitude: order.lng }}
          >
            <View
              style={{
                backgroundColor: "#001A72",
                padding: 10,
                borderRadius: 10,
              }}
            >
              <MaterialIcons name="medical-services" size={30} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>

      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
        <View
          style={{ alignItems: "center", marginBottom: 20, paddingTop: 10 }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              letterSpacing: 0.5,
              paddingBottom: 5,
            }}
          >
            You're Online
          </Text>
          <Text>Available Requests: {orders.length}</Text>
        </View>
        <FlatList
          data={orders}
          renderItem={({ item }) => <SingleRequest order={item} />}
        />
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

export default RequestsScreen;
