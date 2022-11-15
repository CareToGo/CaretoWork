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
  Input,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Auth, DataStore } from "aws-amplify";
import { TransportationModes, Worker } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { PSWService } from "../../models";
import { Storage } from "aws-amplify";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import SelectDropdown from "react-native-select-dropdown";

const EditUser2Screen = () => {
  const { dbWorker, sub, setDbWorker } = useAuthContext();
  const Language = [
    "English",
    "French",
    "Korean",
    "Mandarin",
    "Cantonese",
    "Tagalog",
    "Spanish",
    "Portuguese",
    "Italian",
  ];
  const Gender = ["Male", "Female", "Other"];
  const Profession = ["RN", "RPN", "PSW"];

  const [firstName, setFirstName] = useState(dbWorker?.firstName || "");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [profession, setProfession] = useState("");
  const [languages, setLanguages] = useState("");
  const [experienceDescription, setExperienceDescription] = useState("");
  const [bio, setBio] = useState("");
  const [transportationMode, setTransportationMode] = useState(
    TransportationModes.BICYCLE
  );
  const navigation = useNavigation();
  const [imageData, setImageData] = useState(null);
  const [percentage, setPercentage] = useState(0);

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

  const onSignOutPressed = async () => {
    try {
      await Auth.signOut();
      navigation.navigate("SignIn");
    } catch (e) {
      Alert.alert("Oops", e.message);
    }
  };
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
          return state;
        });
      }
    } catch (e) {
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
        updated.firstName = firstName;
        updated.lastName = lastName;
        updated.transportationMode = transportationMode;
        updated.image = imageData;
      })
    );
    setDbWorker(worker);
  };

  const createWorker = async () => {
    try {
      const worker = await DataStore.save(
        new Worker({
          sub,
          lat: 0,
          lng: 0,
          firstName,
          lastName,
          transportationMode,
          gender,
          profession,
          languages,
          experienceDescription,
          bio,
          isVerified: false,
        })
      );
      console.log(worker);
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
        {imageData ? (
          <Image
            source={{
              uri: imageData,
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

      <ScrollView>
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
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            style={styles.input}
          />
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            style={styles.input}
          />
          <SelectDropdown
            data={Gender}
            defaultButtonText="Select a Gender"
            onSelect={(selectedItem, index) => {
              setGender(selectedItem);
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              // text represented after item is selected
              // if data array is an array of objects then return selectedItem.property to render after item is selected
              return selectedItem;
            }}
            rowTextForSelection={(item, index) => {
              // text represented for each item in dropdown
              // if data array is an array of objects then return item.property to represent item in dropdown
              return item;
            }}
          />
          <SelectDropdown
            data={Profession}
            defaultButtonText="Select a Profession"
            onSelect={(selectedItem, index) => {
              setProfession(selectedItem);
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              // text represented after item is selected
              // if data array is an array of objects then return selectedItem.property to render after item is selected
              return selectedItem;
            }}
            rowTextForSelection={(item, index) => {
              // text represented for each item in dropdown
              // if data array is an array of objects then return item.property to represent item in dropdown
              return item;
            }}
          />

          <SelectDropdown
            data={Language}
            defaultButtonText="Select a Language"
            onSelect={(selectedItem, index) => {
              setLanguages(selectedItem);
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              // text represented after item is selected
              // if data array is an array of objects then return selectedItem.property to render after item is selected
              return selectedItem;
            }}
            rowTextForSelection={(item, index) => {
              // text represented for each item in dropdown
              // if data array is an array of objects then return item.property to represent item in dropdown
              return item;
            }}
          />
          <TextInput
            value={experienceDescription}
            onChangeText={setExperienceDescription}
            placeholder="Experience Description"
            style={styles.input}
          />
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Bio"
            style={styles.input}
          />

          <View style={{ flexDirection: "row" }}>
            <Pressable
              onPress={() => setTransportationMode(TransportationModes.BICYCLE)}
              style={{
                backgroundColor:
                  transportationMode == TransportationModes.BICYCLE
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
        </View>

        <Button
          onPress={onSave}
          title="Save"
          style={{ margin: 10, backgroundColor: "blue" }}
        />
        <Text
          onPress={onSignOutPressed}
          style={{ textAlign: "center", color: "red", margin: 10 }}
        >
          Sign Out
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditUser2Screen;

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
