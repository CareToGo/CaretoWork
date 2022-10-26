import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  Pressable,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Auth, DataStore } from "aws-amplify";
import { TransportationModes, Worker } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Service } from "../../models";
import tw from "tailwind-react-native-classnames";
import { set } from "react-native-reanimated";

const EditUserProfile = () => {
  const { dbWorker, sub, setDbWorker } = useAuthContext();
  const [name, setName] = useState(dbWorker?.name || "");
  const [image, setImage] = useState(dbWorker?.image || "");
  const [info, setInfo] = useState();
  const [transportationMode, setTransportationMode] = useState(
    TransportationModes.BICYCLING
  );
  const [services, setServices] = useState([]);

  const navigation = useNavigation();
  const [selected, setSelected] = useState({});

  useEffect(() => {
    DataStore.query(Service).then(setServices);
  }, []);

  const onSave = async () => {
    if (dbWorker) {
      await updateWorker();
      navigation.goBack();
    } else {
      await createWorker();
    }
  };

  const updateWorker = async () => {
    const worker = await DataStore.save(
      Worker.copyOf(dbWorker, (updated) => {
        updated.name = name;
        updated.transportationMode = transportationMode;
      })
    );
    console.log(worker);
    setDbWorker(worker);
  };

  const createWorker = async () => {
    Object.keys(selected).forEach(function (key) {
      if (selected[key] === false) {
        delete selected[key];
      }
    });

    const keys = Object.keys(selected);
    let service_array = [];
    service_array = services.filter((g) => keys.includes(g.id)).map((g) => g);
    setInfo(service_array);

    try {
      const worker = await DataStore.save(
        new Worker({
          sub,
          lat: 0,
          lng: 0,
          name,
          image,
          transportationMode,
          service: JSON.stringify(info),
        })
      );
      setDbWorker(worker);
      console.log(worker);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.title}>Edit My Profile</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          style={styles.input}
        />
        <TextInput
          value={image}
          onChangeText={setImage}
          placeholder="Image URL"
          style={styles.input}
        />
        <View style={{ flexDirection: "row" }}>
          <Pressable
            onPress={() => setTransportationMode(TransportationModes.BICYCLING)}
            style={{
              backgroundColor:
                transportationMode == TransportationModes.BICYCLING
                  ? "lightgreen"
                  : "white",
              margin: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: "gray",
              borderRadius: 10,
            }}
          >
            <MaterialIcons name="pedal-bike" size={40} color="black" />
          </Pressable>
          <Pressable
            onPress={() => setTransportationMode(TransportationModes.DRIVING)}
            style={{
              backgroundColor:
                transportationMode == TransportationModes.DRIVING
                  ? "lightgreen"
                  : "white",
              margin: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: "gray",
              borderRadius: 10,
            }}
          >
            <FontAwesome5 name="car" size={40} color="black" />
          </Pressable>
        </View>

        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => (
            <View style={tw` border-t border-gray-200 flex-shrink py-0`} />
          )}
          renderItem={({ item: { id, name, description, price }, item }) => (
            <TouchableOpacity
              onPress={() => {
                let newSelected = { ...selected };
                newSelected[item.id] = !newSelected[item.id];
                setSelected(newSelected);
              }}
              style={tw`flex-row items-center justify-between p-5 ${
                selected[id] && "bg-gray-200"
              }`}
            >
              <View style={tw`w-4/5`}>
                <Text style={tw`font-semibold text-lg`}>{name}</Text>
                <Text style={tw`text-gray-500`}>{description}</Text>
              </View>
              <View style={tw``}>
                <Text style={tw`text-lg`}>${price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        <Button
          onPress={onSave}
          title="Save"
          style={{ margin: 10, backgroundColor: "blue" }}
        />
        <Text
          onPress={() => Auth.signOut()}
          style={{ textAlign: "center", color: "red", margin: 10 }}
        >
          Sign Out
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditUserProfile;

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
  },
  input: {
    margin: 10,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
  },
});
