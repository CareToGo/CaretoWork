import { useRef, memo, useMemo, useCallback, useState, useEffect } from "react";
import {
  Text,
  View,
  useWindowDimensions,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  SafeAreaView,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import BottomSheet, { SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FlatList } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import SingleRequest from "../../components/SingleRequest";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { DataStore } from "aws-amplify";
import { Order } from "../../models";
import { Worker } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Slider from "@react-native-community/slider";

const Stack = createNativeStackNavigator();

const RequestsScreen = () => {
  const [orders, setOrders] = useState([]);
  const bottomSheetRef = useRef(null);
  const { height, width } = useWindowDimensions();
  const snapPoints = useMemo(() => [111, "85%"], []);
  const { dbWorker, setDbWorker } = useAuthContext();
  const [online, setOnline] = useState(dbWorker?.online);

  const [lat, setLat] = useState(dbWorker?.lat || 0);
  const [lng, setLng] = useState(dbWorker?.lng || 0);
  const navigation = useNavigation();
  const fetchOrders = async () => {
    const filter = await DataStore.query(Order, (order) =>
      order.orderWorkerId("eq", dbWorker.id)
    );

    setOrders(filter);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLat(location.coords.latitude);
      setLng(location.coords.longitude);
    })();
  }, []);

  const updateWorkerOnline = async () => {
    const worker = await DataStore.save(
      Worker.copyOf(dbWorker, (updated) => {
        updated.online = !online;
      })
    );
    setOnline(!online);
    setDbWorker(worker);
  };

  return (
    <GestureHandlerRootView style={{ backgroundColor: "#FFFFFF", flex: 1 }}>
      {Platform == "ios" ? (
        <MapView
          showsUserLocation={true}
          followsUserLocation={true}
          showsMyLocationButton={true}
          style={{ height: SCREEN_HEIGHT }}
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
                <MaterialIcons
                  name="medical-services"
                  size={30}
                  color="white"
                />
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <MapView
          showsUserLocation={true}
          followsUserLocation={true}
          showsMyLocationButton={true}
          style={{ height: SCREEN_HEIGHT }}
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
                <MaterialIcons
                  name="medical-services"
                  size={30}
                  color="white"
                />
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
        <View
          style={{
            marginBottom: 20,
            paddingTop: 10,
          }}
        >
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: "3%",
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("EditServicesScreen")}
              style={tw`bg-gray-200 p-3 rounded-full shadow-md`}
            >
              <Ionicons name="options" size={21} color="#001A72" />
            </TouchableOpacity>
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
            <TouchableOpacity
              onPress={() => navigation.navigate("EditUser2Screen")}
              style={tw`bg-gray-200 p-3 rounded-full shadow-md`}
            >
              <Ionicons name="person-outline" size={21} color="#001A72" />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text>Available Requests: {orders.length}</Text>
          </View>
        </View>

        <FlatList
          data={orders}
          renderItem={({ item }) => <SingleRequest order={item} />}
        />

        {online ? (
          <TouchableOpacity
            style={{
              backgroundColor: "#3b5092",
              padding: 10,
              borderRadius: 10,
              width: "100%",
              height: SCREEN_HEIGHT / 15,
              justifyContent: "center",
            }}
            underlayColor="#FFFFFF"
            onPress={updateWorkerOnline}
          >
            <Text
              style={{
                color: "#ffde59",
                fontSize: 18,
                textAlign: "center",
              }}
            >
              Online
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: "gray",
              padding: 10,
              borderRadius: 10,
              width: "100%",
              height: SCREEN_HEIGHT / 15,
              justifyContent: "center",
            }}
            underlayColor="#FFFFFF"
            onPress={updateWorkerOnline}
          >
            <Text
              style={{
                color: "#ffde59",
                fontSize: 18,
                textAlign: "center",
              }}
            >
              Offline
            </Text>
          </TouchableOpacity>
        )}
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

export default RequestsScreen;

const styles = StyleSheet.create({
  roundButton: {
    position: "absolute",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 25,
    top: 10,
    left: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderContainer: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  clickableArea: {
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderText: {
    fontSize: 17,
    fontWeight: "500",
  },
  slider: {
    position: "absolute",
    width: 45,
    // height: "90%",
    borderRadius: 10,
    backgroundColor: "#f4f4f4",
  },
});
