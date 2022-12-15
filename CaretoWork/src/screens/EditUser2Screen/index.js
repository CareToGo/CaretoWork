import {
  TouchableOpacity,
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
  Dimensions,
} from "react-native";
import {
  SelectList,
  MultipleSelectList,
} from "react-native-dropdown-select-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Auth, DataStore } from "aws-amplify";
import { TransportationModes, Worker } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { Storage } from "aws-amplify";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import pro1 from "../../../assets/maleprovider.png";
import pro2 from "../../../assets/femaleprovider.png";
import { Fontisto } from "@expo/vector-icons";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const EditUser2Screen = () => {
  const insets = useSafeAreaInsets();
  const { dbWorker, sub, setDbWorker, setAuthUser } = useAuthContext();
  const [imageLink, setImageLink] = useState(imageLink ? imageLink : null);
  const [firstName, setFirstName] = useState(dbWorker?.firstName || "");
  const [lastName, setLastName] = useState(dbWorker?.lastName || "");
  const [gender, setGender] = useState(dbWorker?.gender || "");
  const [profession, setProfession] = useState(dbWorker?.profession || "");
  const [languages, setLanguages] = useState(
    dbWorker?.languages ? JSON.parse(dbWorker.languages) : []
  );
  const [experience, setExperience] = useState(dbWorker?.experience || 0);
  const [isInsured, setIsinsured] = useState(dbWorker?.isInsured || false);
  const [transportationMode, setTransportationMode] = useState(
    dbWorker?.transportationMode || TransportationModes.WALK
  );
  const navigation = useNavigation();
  const [percentage, setPercentage] = useState(0);
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

  useEffect(() => {
    console.log("image", imageLink);
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

  const fetchLink = async () => {
    Storage.get(`${sub}.jpg`)
      .then((mylink) => setImageLink(mylink))
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    fetchLink();
  }, []);

  const onSignOutPressed = async () => {
    await Auth.signOut();
    setAuthUser(null);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: "Images",
      aspect: [1, 1],
      quality: 0.3,
    });
    handleImagePicked(result);
  };

  const handleImagePicked = async (pickerResult) => {
    try {
      if (pickerResult.cancelled) {
        alert("Upload Cancelled");
        return;
      } else {
        setPercentage(0);
        const img = await fetchImageFromUri(pickerResult.uri);
        const uploadUrl = await uploadImage(`${sub}.jpg`, img);
        console.log(uploadUrl);
        const result = await Storage.get(uploadUrl);
        console.log(result);
        setImageLink(result);
        setPercentage(0);
      }
    } catch (e) {
      console.log(e);
      alert("Upload Failed!");
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
        updated.gender = gender;
        updated.profession = profession;
        updated.experience = parseInt(experience);
        updated.isInsured = isInsured;
        updated.languages = JSON.stringify(languages);
        updated.transportationMode = transportationMode;
      })
    );
    setDbWorker(worker);
  };

  const changeGender = () => {
    if (gender == "Male") {
      setGender("Female");
    } else if (gender == "Female") {
      setGender("Other");
    } else if (gender == "Other") {
      setGender("Male");
    }
  };

  const changeProf = () => {
    if (profession == "PSW" || profession == "") {
      setProfession("RN");
    } else if (profession == "RN") {
      setProfession("RPN");
    } else if (profession == "RPN") {
      setProfession("PSW");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        paddingTop: Platform.OS === "ios" ? 0 : insets.top,
      }}
    >
      {/* TOP BACK PART */}
      <View
        style={{
          ...styles.topstatic,
          top: Platform.OS === "ios" ? insets.top - 10 : insets.top + 10,
        }}
      >
        <Image
          source={pro1}
          style={{
            height: SCREEN_HEIGHT / 6,
            resizeMode: "contain",
            position: "absolute",
            left: -30,
            bottom: -10,
            opacity: 0.6,
          }}
        />
        <Image
          source={pro2}
          style={{
            height: SCREEN_HEIGHT / 6,
            resizeMode: "contain",
            position: "absolute",
            right: -30,
            bottom: -10,
            opacity: 0.6,
          }}
        />
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>Edit My Profile</Text>
          <View
            style={{
              width: "100%",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <TouchableOpacity
              style={{ width: "25%" }}
              onPress={pickImage}
              underlayColor="lightgray"
            >
              <Image
                source={{
                  uri: !imageLink
                    ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqXhATMW-sSeAdbYfIGpe9hNhBCo_S_T1EblnSnfKYMw&s"
                    : imageLink,
                }}
                style={{
                  width: "100%",
                  height: undefined,
                  aspectRatio: 1,
                  borderRadius: 100,
                  backgroundColor: "lightgray",
                }}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              width: "100%",
              height: 21,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {percentage !== 0 && (
              <Progress.Bar
                progress={percentage / 100}
                width={SCREEN_WIDTH * 0.75}
                color="#001A72"
              />
            )}
          </View>
        </View>
      </View>
      {/* TOP BACK PART */}

      <ScrollView
        contentContainerStyle={{ alignItems: "center", width: "100%" }}
      >
        <View
          style={{
            backgroundColor: "transparent",
            height: Platform.OS === "ios" ? 150 + insets.top : 170,
            width: "25%",
          }}
        >
          <TouchableOpacity
            style={{
              width: "100%",
              height: undefined,
              aspectRatio: 1,
              marginTop: insets.top + SCREEN_HEIGHT / 15,
            }}
            onPress={pickImage}
            underlayColor="white"
          ></TouchableOpacity>
        </View>

        <View
          style={{
            ...styles.mainContainer,
            elevation: 10,
            shadowColor: "#001A72",
            shadowOffset: { height: -2 },
            shadowOpacity: 0.3,
            shadowRadius: 1,
            height: 1.5 * SCREEN_HEIGHT,
            borderRadius: 12,
          }}
        >
          <View style={{ ...styles.inputContainer }}>
            <View style={{ justifyContent: "center", width: 30 }}>
              <MaterialIcons
                name="drive-file-rename-outline"
                size={30}
                color="#001A72"
              />
            </View>

            <View
              style={{
                flex: 1,
                paddingLeft: 10,
                justifyContent: "center",
                borderColor: "lightgray",
                borderBottomWidth: 1,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  color: "black",
                  fontSize: 15,
                }}
                onChangeText={setFirstName}
                value={firstName}
              />
            </View>

            <View
              style={{
                justifyContent: "center",
                borderColor: "lightgray",
                borderBottomWidth: 1,
              }}
            >
              <Text
                style={{ color: "lightgray", fontSize: 12, textAlign: "right" }}
              >
                FIRST NAME
              </Text>
            </View>
          </View>

          <View style={{ ...styles.inputContainer }}>
            <View style={{ justifyContent: "center", width: 30 }}>
              <MaterialIcons
                name="drive-file-rename-outline"
                size={30}
                color="#001A72"
              />
            </View>

            <View
              style={{
                flex: 1,
                paddingLeft: 10,
                justifyContent: "center",
                borderColor: "lightgray",
                borderBottomWidth: 1,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  color: "black",
                  fontSize: 15,
                }}
                onChangeText={setLastName}
                value={lastName}
              />
            </View>

            <View
              style={{
                justifyContent: "center",
                borderColor: "lightgray",
                borderBottomWidth: 1,
              }}
            >
              <Text
                style={{ color: "lightgray", fontSize: 12, textAlign: "right" }}
              >
                LAST NAME
              </Text>
            </View>
          </View>

          <View style={{ ...styles.inputContainer }}>
            <View style={{ justifyContent: "center", width: 30 }}>
              <MaterialIcons name="person-pin" size={30} color="#001A72" />
            </View>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingLeft: 10,
                justifyContent: "center",
                borderColor: "lightgray",
                borderBottomWidth: 1,
              }}
              onPress={changeGender}
            >
              <Text style={{ color: "black", fontSize: 15 }}>{gender}</Text>
            </TouchableOpacity>

            <View
              style={{
                justifyContent: "center",
                borderColor: "lightgray",
                borderBottomWidth: 1,
              }}
            >
              <Text
                style={{ color: "lightgray", fontSize: 12, textAlign: "right" }}
              >
                GENDER
              </Text>
            </View>
          </View>

          <View style={{ ...styles.inputContainer }}>
            <View style={{ justifyContent: "center", width: 30 }}>
              <Fontisto name="nursing-home" size={30} color="#001A72" />
            </View>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingLeft: 10,
                justifyContent: "center",
                borderColor: "lightgray",
                borderBottomWidth: 1,
              }}
              onPress={changeProf}
            >
              <Text style={{ color: "black", fontSize: 15 }}>{profession}</Text>
            </TouchableOpacity>

            <View
              style={{
                justifyContent: "center",
                borderColor: "lightgray",
                borderBottomWidth: 1,
              }}
            >
              <Text
                style={{ color: "lightgray", fontSize: 12, textAlign: "right" }}
              >
                PROFESSION
              </Text>
            </View>
          </View>

          <View style={{ ...styles.inputContainer }}>
            <View style={{ justifyContent: "center", width: 30 }}>
              <MaterialCommunityIcons
                name="av-timer"
                size={30}
                color="#001A72"
              />
            </View>

            <View
              style={{
                flex: 1,
                paddingLeft: 10,
                justifyContent: "center",
                borderColor: "lightgray",
                borderBottomWidth: 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ paddingRight: 15 }}>
                  <Text style={{ fontSize: 15 }}>{experience}</Text>
                </View>
                <View style={{ flexDirection: "column" }}>
                  <TouchableOpacity
                    style={{ borderBottomWidth: 1, borderColor: "lightgray" }}
                    onPress={() => setExperience(experience + 1)}
                  >
                    <AntDesign name="up-square-o" size={21} color="#001A72" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setExperience(experience - 1)}
                    disabled={experience == 0}
                  >
                    <AntDesign name="down-square-o" size={21} color="#001A72" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View
              style={{
                justifyContent: "center",
                borderColor: "lightgray",
                borderBottomWidth: 1,
              }}
            >
              <Text
                style={{ color: "lightgray", fontSize: 12, textAlign: "right" }}
              >
                YEARS OF EXPERIENCE
              </Text>
            </View>
          </View>

          <View
            style={{ width: "100%", zIndex: 99, marginTop: SCREEN_HEIGHT / 25 }}
          >
            <View>
              <Text
                style={{
                  color: "lightgray",
                  fontWeight: "bold",
                  paddingBottom: 3,
                  fontSize: 12,
                }}
              >
                WHAT LANGUAGES ARE YOU FLUENT IN?
              </Text>
            </View>
            <View style={styles.selectorContainer}>
              <View
                style={{
                  width: "15%",
                  alignItems: "center",
                  paddingLeft: "5%",
                }}
              >
                <FontAwesome name="language" size={30} color="#001A72" />
              </View>
              <View style={{ width: "85%" }}>
                <MultipleSelectList
                  setSelected={(val) => setLanguages(val)}
                  data={Language}
                  save="key"
                  placeholder={
                    languages.length == 0
                      ? "Languages"
                      : JSON.stringify(languages)
                          .replace(/['"]+/g, "")
                          .replace(/[\[\]']+/g, "")
                  }
                  boxStyles={{ width: "100%", borderWidth: 0, top: 5 }}
                  dropdownStyles={styles.dropdownContainer}
                  dropdownItemStyles={{ height: 33 }}
                  dropdownTextStyles={{ fontSize: 12 }}
                  search={false}
                  label="Languages"
                  labelStyles={{ color: "lightgray" }}
                  maxHeight={600}
                  arrowicon={
                    <AntDesign name="caretdown" size={15} color="#001A72" />
                  }
                />
              </View>
            </View>
          </View>

          <View
            style={{ width: "100%", zIndex: 98, marginTop: SCREEN_HEIGHT / 25 }}
          >
            <View>
              <Text
                style={{
                  color: "lightgray",
                  fontWeight: "bold",
                  paddingBottom: 3,
                  fontSize: 12,
                }}
              >
                DO YOU HAVE INSURANCE COVERAGE?
              </Text>
            </View>
            <View style={styles.selectorContainer}>
              <View
                style={{
                  width: "15%",
                  alignItems: "center",
                  paddingLeft: "5%",
                }}
              >
                <AntDesign name="Safety" size={30} color="#001A72" />
              </View>
              <View style={{ width: "85%" }}>
                <SelectList
                  setSelected={(val) =>
                    setIsinsured(val == "YES" ? true : false)
                  }
                  data={["YES", "NO"]}
                  save="key"
                  placeholder={isInsured ? "YES" : "NO"}
                  boxStyles={{ width: "100%", borderWidth: 0 }}
                  dropdownStyles={{ ...styles.dropdownContainer, marginTop: 9 }}
                  dropdownItemStyles={{ height: 33 }}
                  dropdownTextStyles={{ fontSize: 12 }}
                  search={false}
                  label="Do you have private insurance?"
                  labelStyles={{ color: "lightgray" }}
                  maxHeight={600}
                  arrowicon={
                    <AntDesign name="caretdown" size={15} color="#001A72" />
                  }
                />
              </View>
            </View>
          </View>

          <View
            style={{ width: "100%", zIndex: 97, marginTop: SCREEN_HEIGHT / 25 }}
          >
            <View>
              <Text
                style={{
                  color: "lightgray",
                  fontWeight: "bold",
                  paddingBottom: 3,
                  fontSize: 12,
                }}
              >
                HOW ARE YOU TRAVELLING?
              </Text>
            </View>
            <View style={styles.selectorContainer}>
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Pressable
                  onPress={() =>
                    setTransportationMode(TransportationModes.BICYCLE)
                  }
                  style={{
                    backgroundColor:
                      transportationMode == TransportationModes.BICYCLE
                        ? "#001A72"
                        : "white",
                    margin: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: "gray",
                    borderRadius: 10,
                    width: 63,
                  }}
                >
                  <MaterialIcons
                    name="pedal-bike"
                    size={40}
                    color={
                      transportationMode == TransportationModes.BICYCLE
                        ? "white"
                        : "#001A72"
                    }
                  />
                </Pressable>

                <Pressable
                  onPress={() => setTransportationMode(TransportationModes.CAR)}
                  style={{
                    backgroundColor:
                      transportationMode == TransportationModes.CAR
                        ? "#001A72"
                        : "white",
                    margin: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: "gray",
                    borderRadius: 10,
                    width: 63,
                  }}
                >
                  <FontAwesome5
                    name="car"
                    size={40}
                    color={
                      transportationMode == TransportationModes.CAR
                        ? "white"
                        : "#001A72"
                    }
                  />
                </Pressable>

                <Pressable
                  onPress={() =>
                    setTransportationMode(TransportationModes.WALK)
                  }
                  style={{
                    backgroundColor:
                      transportationMode == TransportationModes.WALK
                        ? "#001A72"
                        : "white",
                    margin: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: "gray",
                    borderRadius: 10,
                    width: 63,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome5
                    name="walking"
                    size={40}
                    color={
                      transportationMode == TransportationModes.WALK
                        ? "white"
                        : "#001A72"
                    }
                  />
                </Pressable>
              </View>
            </View>
          </View>

          <View
            style={{ width: "100%", zIndex: 97, marginTop: SCREEN_HEIGHT / 25 }}
          >
            <View
              style={{
                width: "100%",
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#3b5092",
                  padding: 10,
                  borderRadius: 10,
                  width: "100%",
                  height: SCREEN_HEIGHT / 15,
                  justifyContent: "center",
                }}
                onPress={onSave}
                underlayColor="#FFFFFF"
              >
                <Text
                  style={{
                    color: "#ffde59",
                    fontSize: 18,
                    textAlign: "center",
                  }}
                >
                  SAVE
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{ width: "100%", zIndex: 96, marginTop: SCREEN_HEIGHT / 25 }}
          >
            <View
              style={{
                width: "100%",
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#3b5092",
                  padding: 10,
                  borderRadius: 10,
                  width: "100%",
                  height: SCREEN_HEIGHT / 15,
                  justifyContent: "center",
                }}
                onPress={onSignOutPressed}
                underlayColor="#FFFFFF"
              >
                <Text
                  style={{
                    color: "#ffde59",
                    fontSize: 18,
                    textAlign: "center",
                  }}
                >
                  SIGN OUT
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditUser2Screen;

const styles = StyleSheet.create({
  topstatic: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    height: 150,
  },
  title: {
    fontSize: 27,
    textAlign: "center",
    margin: 10,
    width: "100%",
  },
  input: {
    margin: 10,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
  },
  mainContainer: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    paddingHorizontal: "6%",
    width: "100%",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    borderColor: "lightgray",
    paddingBottom: 0,
    borderRadius: 10,
    paddingHorizontal: 5,
    height: SCREEN_HEIGHT / 12,
    justifyContent: "center",
    width: "85%",
  },
  selectorContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "lightgray",
    borderRadius: 10,
    minHeight: SCREEN_HEIGHT / 12,
  },
  dropdownContainer: {
    backgroundColor: "#F9FCFF",
    position: "absolute",
    width: "120%",
    top: "100%",
    left: "-19%",
    borderWidth: 3,
    paddingHorizontal: 10,
    borderColor: "lightgray",
    marginTop: 3,
  },
  shadowProp: {
    shadowColor: "#001A72",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
