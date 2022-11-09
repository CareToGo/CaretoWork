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
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FlatList } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import SingleRequest from "../../components/SingleRequest";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { DataStore } from "aws-amplify";
import { Order } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const RequestsScreen = () => {
  const [orders, setOrders] = useState([]);
  const bottomSheetRef = useRef(null);
  const { height, width } = useWindowDimensions();
  const snapPoints = useMemo(() => [140, "85%"], []);
  const { dbWorker } = useAuthContext();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const startAnimation = (toValue) => {
    Animated.timing(animatedValue, {
      toValue,
      duration: 400,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const left = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["2%", "50%"],
    extrapolate: "clamp",
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 1],
    extrapolate: "clamp",
  });
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
  return (
    <GestureHandlerRootView style={{ backgroundColor: "lightblue", flex: 1 }}>
      <TouchableOpacity
        style={tw`bg-gray-100 absolute top-16 left-8 z-50 p-3 rounded-full shadow-lg`}
        onPress={startAnimation.bind(null, 1)}
      >
        <Ionicons name="options" size={24} color="#001A72" />
      </TouchableOpacity>

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
              paddingHorizontal: "7%",
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("EditServicesScreen")}
              style={tw`bg-gray-100 p-3 rounded-full shadow-lg`}
            >
              <Ionicons name="options" size={24} color="#001A72" />
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
              style={tw`bg-gray-100 p-3 rounded-full shadow-lg`}
            >
              <Ionicons name="person-outline" size={24} color="#001A72" />
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
