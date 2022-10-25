import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Auth, DataStore } from "aws-amplify";
import { TransportationModes, Worker } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

const EditUserProfile = () => {
  const { dbWorker, sub, setDbWorker } = useAuthContext();
  const [name, setName] = useState(dbWorker?.name || "");
  const [image, setImage] = useState(dbWorker?.image || "");
  const [transportationMode, setTransportationMode] = useState(
    TransportationModes.BICYCLING
  );
  const navigation = useNavigation();

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
    try {
      const worker = await DataStore.save(
        new Worker({
          sub,
          lat: 0,
          lng: 0,
          name,
          image,
          transportationMode,
        })
      );
      setDbWorker(worker);
      console.log(worker);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView>
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
