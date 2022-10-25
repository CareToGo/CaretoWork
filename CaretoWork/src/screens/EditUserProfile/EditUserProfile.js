import { View, Text, TextInput, StyleSheet, Button, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Auth, DataStore } from "aws-amplify";
import { Worker } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

const EditUserProfile = () => {
  const { dbWorker, sub, setDbWorker } = useAuthContext();
  const [name, setName] = useState(dbWorker?.name || "");
  const [image, setImage] = useState(dbWorker?.image || "");
  const [address, setAddress] = useState(dbWorker?.address || "");
  const [lat, setLat] = useState(dbWorker?.lat + "" || "0");
  const [lng, setLng] = useState(dbWorker?.lng + "" || "0");
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
        updated.firstname = firstname;
        updated.lastname = lastname;
        updated.address = address;
        updated.lat = parseFloat(lat);
        updated.lng = parseFloat(lng);
        updated._version = parseInt(dbUser.ver);
        updated.ver = dbUser.ver + 1;
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
          address,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          firstname,
          lastname,
          ver: 1,
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
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Address"
        style={styles.input}
      />
      <TextInput
        value={lat}
        onChangeText={setLat}
        placeholder="Latitude"
        style={styles.input}
      />
      <TextInput
        value={lng}
        onChangeText={setLng}
        placeholder="Longitude"
        style={styles.input}
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
