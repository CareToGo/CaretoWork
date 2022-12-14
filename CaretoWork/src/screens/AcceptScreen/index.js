import { useRef, memo, useMemo, useCallback, useState, useEffect } from "react";
import {
  Text,
  View,
  Dimensions,
  useWindowDimensions,
  PermissionsAndroid,
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { DataStore } from "aws-amplify";
import { Order, User } from "../../models";
import OrderContextProvider, {
  useOrderContext,
} from "../../contexts/OrderContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ORDER_STATUSES = {
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
};

const AcceptScreen = () => {
  const [orders, setOrders] = useState([]);
  const {
    order,
    user,
    acceptOrder,
    fetchOrder,
    userImage,
    arrivedOrder,
    completeOrder,
  } = useOrderContext();
  const navigation = useNavigation();
  const [homecareLocation, setHomecareLocation] = useState(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const bottomSheetRef = useRef(null);
  const { height, width } = useWindowDimensions();
  const snapPoints = useMemo(() => [100, "95%"], []);
  const route = useRoute();
  const id = route.params?.id;
  const data = route.params;

  const fetchOrders = async () => {
    const results = await DataStore.query(Order);
    setOrders(results);
  };

  useEffect(() => {
    fetchOrder(id);

    const subscription = DataStore.observe(Order).subscribe((msg) => {
      if (msg.opType === "UPDATED") {
        fetchOrders();
      }
    });
    return () => subscription.unsubscribe();
  }, [id]);

  const namewidth = (SCREEN_WIDTH * 0.75) / data.name.length;
  let namesize;
  if (namewidth <= 27) {
    namesize = namewidth;
  } else {
    namesize = 27;
  }

  const mapRef = useRef();

  const [orderStatus, setOrderStatus] = useState(
    ORDER_STATUSES.READY_FOR_PICKUP
  );

  const [isClose, setIsClose] = useState(false);

  useEffect(() => {
    fetchOrders();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (!status === "granted") {
        console.log("Nonono");
        return;
      }

      let location = await Location.getCurrentPositionAsync();
      setHomecareLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
    console.log(data);
    // const foregroundSubscription = Location.watchPositionAsync(
    //   {
    //     accuracy: Location.Accuracy.High,
    //     distanceInterval: 100,
    //   },
    //   (updatedLocation) => {
    //     setHomecareLocation({
    //       latitude: updatedLocation.coords.latitude,
    //       longitude: updatedLocation.coords.longitude,
    //     });
    //   }
    // );
    // return foregroundSubscription;
  }, []);

  if (!homecareLocation) {
    return <ActivityIndicator size={"large"} />;
  }
  const orderLocation = {
    latitude: order?.lat,
    longitude: order?.lng,
  };
  if (!order || !orderLocation) {
    return <ActivityIndicator size={"large"} />;
  }

  function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  const svcArray = JSON.parse(order.service).map((service) => (
    <Text key={service.id} style={styles.srvcbtnsmall}>
      {service.name}
    </Text>
  ));

  const onButtonPressed = async () => {
    if (order.status == "NEW") {
      bottomSheetRef.current.collapse();
      mapRef.current.animateToRegion({
        latitude: homecareLocation.latitude,
        longitude: homecareLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      await acceptOrder();
    } else if (order.status === "ACCEPTED") {
      bottomSheetRef.current?.collapse();
      await arrivedOrder();
    } else if (order.status === "ARRIVED") {
      bottomSheetRef.current?.collapse();
      await completeOrder();
    } else if (order.status === "COMPLETED") {
      bottomSheetRef.current?.collapse();
      navigation.goBack();
    }
  };

  const renderButtonTitle = () => {
    if (order.status === "NEW") {
      return "Accept Order";
    }
    if (order.status === "ACCEPTED") {
      return "Arrived";
    }

    if (order.status === "ARRIVED") {
      return "Arrived";
    }
    if (order.status === "COMPLETED") {
      return "Complete";
    }
  };
  const isButtonDisabled = () => {
    if (order.status === "NEW") {
      return false;
    }
    if (order.status === "ACCEPTED" && isClose) {
      return false;
    }
    if (order.status === "ARRIVED") {
      return false;
    }
    if (order.status === "Complete") {
      return false;
    }
    return true;
  };

  return (
    <GestureHandlerRootView style={{ backgroundColor: "lightblue", flex: 1 }}>
      <MapView
        ref={mapRef}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: homecareLocation.latitude,
          longitude: homecareLocation.longitude,
          latitudeDelta: 0.07,
          longitudeDelta: 0.07,
        }}
        style={{ height, width }}
      >
        <MapViewDirections
          origin={homecareLocation}
          destination={{
            latitude: order.lat,
            longitude: order.lng,
          }}
          strokeWidth={10}
          waypoints={[{ latitude: order.lat, longitude: order.lng }]}
          apikey={"AIzaSyAwqJ3mR3salkuJ6noO2q9RvslWxIX5t3Y"}
          onReady={(result) => {
            if (result.distance < 0.0001) {
              setIsClose(true);
            }
            setTotalMinutes(result.duration);
            setTotalKm(result.distance);
          }}
        />

        {orders.map((order) => (
          <Marker
            key={order?.id}
            title={order?.name}
            description={order?.address}
            coordinate={{ latitude: order?.lat, longitude: order?.lng }}
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
            alignItems: "center",
            marginBottom: 20,
            paddingTop: 10,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 25, letterSpacing: 1 }}>
            {totalMinutes.toFixed(1)} min
          </Text>
          <FontAwesome5
            name="hand-holding-medical"
            size={30}
            color="#001A72"
            style={{ marginHorizontal: 10 }}
          />
          <Text style={{ fontSize: 25, letterSpacing: 1 }}>
            {totalKm.toFixed(2)} km
          </Text>
        </View>
        <ScrollView
          style={{
            paddingHorizontal: "3%",
            backgroundColor: "white",
          }}
        >
          <View style={styles.client}>
            <View style={styles.clientphoto}>
              <Image
                source={{
                  uri: userImage,
                }}
                style={{
                  width: SCREEN_WIDTH * 0.33,
                  height: SCREEN_WIDTH * 0.33,
                  borderRadius: SCREEN_WIDTH * 0.18,
                }}
              />
            </View>
            <View style={styles.clientinfo}>
              <Text
                numberOfLines={1}
                style={{
                  fontWeight: "500",
                  fontSize: namewidth,
                  width: "100%",
                }}
              >
                {user?.firstname} {user?.lastname}
              </Text>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  marginTop: 3,
                  marginLeft: -5,
                  marginBottom: 3,
                }}
              >
                <Text style={{ fontSize: 18 }}>4.8</Text>
                <Text style={{ marginLeft: -3, marginTop: 1 }}>
                  {" "}
                  <MaterialIcons name="star" size={21} color="#FFDE59" />{" "}
                </Text>
              </View>
              <Text style={{ color: "grey" }}>{order?.address}</Text>
              <Text style={{ color: "grey" }}>{user?.contactnum}</Text>
              <Text style={{ color: "grey" }}>{order?.time}</Text>
            </View>
          </View>

          <View
            style={{
              width: "100%",
              borderTopWidth: 1,
              paddingTop: 10,
              borderColor: "lightgrey",
              marginTop: 20,
            }}
          >
            <View style={{ width: "100%" }}>
              <Text
                numberOfLines={1}
                style={{ fontWeight: "500", fontSize: 21, width: "100%" }}
              >
                Request Details
              </Text>
            </View>
            <View style={{ width: "100%", marginTop: 2 }}>
              <Text style={{ fontSize: 15, color: "grey" }}>
                {/* Allergies: {srvc.allergies} */}
              </Text>
              <Text style={{ fontSize: 15, color: "grey" }}>
                Diagnosis: None
              </Text>
              <Text style={{ fontSize: 15, color: "grey" }}>
                {/* {srvc.gender} : {getAge(srvc.DOB)} YO */}
              </Text>
              <Text style={{ fontSize: 15, color: "grey" }}>
                {/* Languages: {srvc.language} */}
              </Text>
              <Text style={{ fontSize: 15, color: "grey" }}>
                {/* Scheduled Time: {srvc.RequestDetails.time} */}
              </Text>
            </View>
            <View style={{ width: "100%", marginTop: 20 }}>
              <Text
                numberOfLines={1}
                style={{ fontWeight: "500", fontSize: 21, width: "100%" }}
              >
                Services Requested:{" "}
              </Text>
            </View>
            <View
              style={{
                width: "100%",
                marginTop: 2,
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {svcArray}
            </View>
            {/* <View style={{ width: "100%", marginTop: 20 }}>
              <Text
                numberOfLines={1}
                style={{ fontWeight: "500", fontSize: 21, width: "100%" }}
              >
                Client Message:{" "}
              </Text>
            </View> */}
            {/* <View
              style={{
                width: "100%",
                marginTop: 2,
                borderWidth: 2,
                borderColor: "lightgrey",
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 15, color: "grey" }}>
                {srvc.description}
              </Text>
            </View> */}
          </View>

          <Pressable
            style={{
              marginBottom: 0,
              marginTop: 200,
              backgroundColor: isButtonDisabled() ? "grey" : "#3FC060",
              width: "100%",
              height: 60,
              borderRadius: 15,
              textAlign: "center",
              justifyContent: "center",
            }}
            onPress={onButtonPressed}
            disabled={isButtonDisabled()}
          >
            <Text style={{ textAlign: "center", fontSize: 21, color: "white" }}>
              {renderButtonTitle()}
            </Text>
          </Pressable>

          <Pressable
            style={{
              marginTop: 20,
              backgroundColor: "#ff6666",
              width: "100%",
              height: 60,
              borderRadius: 15,
              textAlign: "center",
              justifyContent: "center",
            }}
            onPress={navigation.goBack}
          >
            <Text style={{ textAlign: "center", fontSize: 21, color: "white" }}>
              Decline Request
            </Text>
          </Pressable>

          {/* <View style={{ height: 50 }}>
            <Text> </Text>
          </View> */}
        </ScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  topbrief: {
    width: "100%",
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  client: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    borderTopWidth: 1,
    paddingTop: 20,
    borderColor: "lightgrey",
  },
  clientphoto: {
    width: "40%",
    alignItems: "flex-start",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "lightgrey",
  },
  clientinfo: {
    width: "60%",
    alignItems: "flex-start",
    paddingLeft: "3%",
    borderRightColor: "lightgrey",
  },
  srvcbtnsmall: {
    color: "black",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
    width: "45%",
    overflow: "hidden",
    fontSize: (SCREEN_WIDTH * 0.7) / 20,
  },
});

export default AcceptScreen;
