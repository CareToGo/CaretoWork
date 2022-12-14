import { StatusBar } from "expo-status-bar";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Storage, DataStore } from "aws-amplify";
import { User } from "../../models";
import { useOrderContext } from "../../contexts/OrderContext";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SingleRequest = ({ order }) => {
  const {
    user,
    acceptOrder,
    fetchOrder,
    userImage,
    arrivedOrder,
    completeOrder,
  } = useOrderContext();
  const [services, setServices] = useState([]);
  const [homecareLocation, setHomecareLocation] = useState(null);
  const [imageLink, setImageLink] = useState();

  const fetchLink = async () => {
    const user = await DataStore.query(User, order.userID);
    Storage.get(`${user.sub}.jpg`)
      .then((mylink) => setImageLink(mylink))
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    fetchLink();
    setServices(JSON.parse(order.service));
    // (async () => {
    //   let { status } = await Location.requestForegroundPermissionsAsync();
    //   if (!status === "granted") {
    //     console.log("Nonono");
    //     return;
    //   }

    //   let location = await Location.getCurrentPositionAsync();
    //   setHomecareLocation({
    //     latitude: location.coords.latitude,
    //     longitude: location.coords.longitude,
    //   });
    // })();

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

  // if (!homecareLocation) {
  //   return <ActivityIndicator size={"large"} />;
  // }

  const svcArray = services.map((service) => (
    <Text key={service.id} style={styles.srvcbtn}>
      {service.name}
    </Text>
  ));
  const navigation = useNavigation();
  const pressHandler = () => {
    navigation.navigate("AcceptScreen", order);
  };

  return (
    <Pressable style={styles.singlereq} onPress={pressHandler}>
      <Image
        source={{
          uri: imageLink,
        }}
        style={{
          width: "35%",
          height: "100%",
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 10,
        }}
      />
      <View style={{ marginLeft: 10, marginRight: 10, flex: 1, width: "50%" }}>
        <Text style={{ fontSize: 24, fontWeight: "600" }}>{order?.name}</Text>
        <Text style={{ color: "grey" }}>{order?.address}</Text>
        <Text style={{ color: "grey" }}>{order?.time}</Text>
        <Text style={{ color: "black" }}>ORDER {order?.status}</Text>
        <Text style={{ marginTop: 10, fontSize: (SCREEN_WIDTH * 0.75) / 19 }}>
          {svcArray.length} Services Requested
        </Text>
      </View>
      <View
        style={{
          padding: 5,
          backgroundColor: "#001A72",
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
          marginLeft: "auto",
          width: "15%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Entypo
          name="chevron-thin-right"
          size={30}
          color="gray"
          style={{ margin: "auto" }}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  srvcbtn: {
    color: "#FFDE59",
    backgroundColor: "#001A72",
    borderRadius: 5,
    padding: 6,
    textAlign: "center",
    marginTop: 5,
    overflow: "hidden",
    fontSize: (SCREEN_WIDTH * 0.7) / 20,
  },
  singlereq: {
    flexDirection: "row",
    borderColor: "#FFDE59",
    borderWidth: 1,
    margin: 9,
    borderRadius: 12,
    padding: 3,
  },
});

export default SingleRequest;
