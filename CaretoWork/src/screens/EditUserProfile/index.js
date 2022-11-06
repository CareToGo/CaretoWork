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
  Image,
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
import { Storage } from "aws-amplify";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import tw from "tailwind-react-native-classnames";

const EditUserProfile = () => {
  const { dbWorker, sub, setDbWorker } = useAuthContext();
  const [name, setName] = useState(dbWorker?.name || "");
  const [info, setInfo] = useState();
  const [transportationMode, setTransportationMode] = useState(
    TransportationModes.BICYCLING
  );
  const [services, setServices] = useState([]);

  const navigation = useNavigation();

  const [selected, setSelected] = useState({});
  const [imageData, setImageData] = useState(null);
  const [percentage, setPercentage] = useState(0);
  const fetchService = async () => {
    const results = await DataStore.query(Service);
    setServices(results);
    let initialSelected = {};
    for (let item of results) {
      initialSelected[item.id] = false;
      setSelected(initialSelected);
    }
  };

  useEffect(() => {
    fetchService();
  }, []);

  useEffect(() => {
    (async () => {
      if (Constants.platform.ios) {
        const cameraRollStatus =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (
          cameraRollStatus.status !== "granted" ||
          cameraStatus.status !== "granted"
        ) {
          alert("Sorry, we need these permissions to make this work!");
        }
      }
    })();
  }, []);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Images",
      aspect: [4, 3],
      quality: 1,
    });

    handleImagePicked(result);
  };

  const handleImagePicked = async (pickerResult) => {
    try {
      if (pickerResult.cancelled) {
        alert("Upload cancelled");
        return;
      } else {
        setPercentage(0);
        const img = await fetchImageFromUri(pickerResult.uri);
        const uploadUrl = await uploadImage(`${sub}.jpg`, img);
        const result = await Storage.get(uploadUrl);
        setImageData(result);
        setImageData((state) => {
          console.log(state);
          return state;
        });
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed");
    }
  };

  const uploadImage = (filename, img) => {
    Auth.currentCredentials();
    return Storage.put(filename, img, {
      level: "public",
      contentType: "image/jpeg",
      progressCallback(progress) {
        setLoading(progress);
      },
    })
      .then((response) => {
        return response.key;
      })
      .catch((error) => {
        console.log(error);
        return error.response;
      });
  };

  const setLoading = (progress) => {
    const calculated = parseInt((progress.loaded / progress.total) * 100);
    updatePercentage(calculated);
  };

  const updatePercentage = (number) => {
    setPercentage(number);
  };

  const fetchImageFromUri = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

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
        updated.image = imageData;
      })
    );
    setDbWorker(worker);
  };

  const createWorker = async () => {
    Object.keys(selected).forEach(function (key) {
      if (selected[key] == false) {
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
          image: imageData,
          transportationMode,
          service: JSON.stringify(info),
        })
      );
      setDbWorker(worker);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          width: "100%",
          borderWidth: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {imageData || dbWorker?.image ? (
          <Image
            source={{
              uri: imageData ? imageData : dbWorker?.image,
            }}
            style={{
              width: "30%",
              height: undefined,
              aspectRatio: 1,
              borderRadius: 100,
            }}
          />
        ) : (
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqXhATMW-sSeAdbYfIGpe9hNhBCo_S_T1EblnSnfKYMw&s",
            }}
            style={{
              width: "30%",
              height: undefined,
              aspectRatio: 1,
              borderRadius: 100,
            }}
          />
        )}
      </View>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Edit My Profile</Text>
            <View style={styles.container}>
              {percentage !== 0 && (
                <Text style={styles.percentage}>{percentage}%</Text>
              )}

              <Button
                onPress={pickImage}
                title="Pick an image from camera roll"
              />
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              style={styles.input}
            />

            <View style={{ flexDirection: "row" }}>
              <Pressable
                onPress={() =>
                  setTransportationMode(TransportationModes.BICYCLING)
                }
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
                onPress={() =>
                  setTransportationMode(TransportationModes.DRIVING)
                }
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
          </View>
        }
        ListFooterComponent={() => (
          <ScrollView>
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
        )}
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
