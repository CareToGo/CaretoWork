import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Image,
  Input,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Auth, DataStore } from "aws-amplify";
import { TransportationModes, Worker } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import * as Location from "expo-location";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  SelectList,
  MultipleSelectList,
} from "react-native-dropdown-select-list";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const EditUserProfile = () => {
  const { dbWorker, setDbWorker } = useAuthContext();
  const [location, setLocation] = useState(null);
  const [sub, setSub] = useState(sub ? sub : "");
  const [firstName, setFirstName] = useState(firstName ? firstName : "");
  const [lastName, setLastName] = useState(lastName ? lastName : "");
  const [gender, setGender] = useState(gender ? gender : "");
  const [profession, setProfession] = useState(profession ? profession : "");
  const [experience, setExperience] = useState(experience ? experience : 0);
  const [isInsured, setIsinsured] = useState(isInsured ? isInsured : false);
  const [transportationMode, setTransportationMode] = useState(
    TransportationModes.BICYCLE
  );
  const navigation = useNavigation();

  const fetchsub = async () => {
    Auth.currentAuthenticatedUser()
      .then((results) => {
        setSub(results.attributes.sub);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchsub();
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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const onSave = async () => {
    if (dbWorker) {
      await updateWorker();
      navigation.navigate("RequestsScreen");
    } else {
      await createWorker();
      navigation.navigate("RequestsScreen");
    }
  };

  const updateWorker = async () => {
    const worker = await DataStore.save(
      Worker.copyOf(dbWorker, (updated) => {
        updated.firstName = firstName;
        updated.lastName = lastName;
        updated.transportationMode = transportationMode;
      })
    );
    setDbWorker(worker);
  };

  const createWorker = async () => {
    try {
      const worker = await DataStore.save(
        new Worker({
          sub,
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          firstName,
          lastName,
          gender,
          profession,
          experience,
          isInsured,
          transportationMode,
          isVerified: false,
          online: true,
          maxDistance: parseInt(2),
        })
      );
      console.log(worker);
      setDbWorker(worker);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const changeGender = () => {
    if (gender == "Male") {
      setGender("Female");
    } else if (gender == "Female") {
      setGender("Other");
    } else if (gender == "Other" || gender == "") {
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

  const onSignOutPressed = async () => {
    await Auth.signOut();
    setAuthUser(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Text style={styles.title}>Create Your Profile</Text>

      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          width: "100%",
          borderWidth: 0,
        }}
      >
        <View style={{ ...styles.mainContainer, height: 1.5 * SCREEN_HEIGHT }}>
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
                  CREATE
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
    </SafeAreaView>
  );
};

export default EditUserProfile;

const styles = StyleSheet.create({
  title: {
    fontSize: 27,
    fontWeight: "300",
    textAlign: "center",
    margin: 10,
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
    width: "97%",
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
});
