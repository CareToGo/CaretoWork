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

  useEffect(() => {
    DataStore.query(Order).then(setOrders);
  }, []);

  console.log(orders);
  return (
    <GestureHandlerRootView style={{ backgroundColor: "lightblue", flex: 1 }}>
      <MapView
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}
        style={{ height, width }}
      >
        {srvcReqs.map((req) => (
          <Marker
            key={req.reqid}
            title={req.Client.name}
            description={req.Client.address}
            coordinate={{ latitude: req.Client.lat, longitude: req.Client.lng }}
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
          <Text>Available Requests: {srvcReqs.length}</Text>
        </View>
        <FlatList
          data={srvcReqs}
          renderItem={({ item }) => <SingleRequest request={item} />}
        />
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

export default RequestsScreen;
