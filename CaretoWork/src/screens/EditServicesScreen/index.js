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
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { a, Auth, DataStore } from "aws-amplify";
import { NurseService, TransportationModes, Worker } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { PSWService } from "../../models";
import tw from "tailwind-react-native-classnames";

const EditServiceScreen = () => {
  const { dbWorker, setDbWorker } = useAuthContext();

  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState({});
  const [nurseServices, setNurseServices] = useState([]);
  const [nurseSelected, setNurseSelected] = useState({});
  const navigation = useNavigation();

  const [isEnabled, setIsEnabled] = useState(false);

  const personalSupport = () => {
    // startAnimation.bind(null, 0);
    setIsEnabled(false);
    // console.log(dbWorker.isVerified);
  };

  const nurseSupport = () => {
    // startAnimation.bind(null, 1);
    setIsEnabled(true);
  };
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

  const queryPSWService = async () => {
    const subscription = DataStore.observeQuery(PSWService).subscribe(
      (snapshot) => {
        const { items } = snapshot;
        setServices(items);
        let initialSelected = {};
        for (let item of items) {
          initialSelected[item.id] = false;
          setSelected(initialSelected);
        }
      }
    );
  };
  const queryNurseService = async () => {
    const subscription = DataStore.observeQuery(NurseService).subscribe(
      (snapshot) => {
        const { items } = snapshot;
        setNurseServices(items);
        let initialSelected = {};
        for (let item of items) {
          initialSelected[item.id] = false;
          setNurseSelected(initialSelected);
        }
      }
    );
  };

  useEffect(() => {
    queryPSWService();
    queryNurseService();
  }, []);

  const onSave = async () => {
    await updateWorker();
    navigation.goBack();
  };

  const updateWorker = async () => {
    let totalService = [...services, ...nurseServices];

    console.log(totalService[0]);
    Object.keys(selected).forEach(function (key) {
      if (selected[key] == false) {
        delete selected[key];
      }
    });
    const keys = Object.keys(selected);
    let service_array = [];
    service_array = totalService
      .filter((g) => keys.includes(g.id))
      .map((g) => g);
    try {
      const worker = await DataStore.save(
        Worker.copyOf(dbWorker, (updated) => {
          updated.services = JSON.stringify(service_array);
        })
      );
      setDbWorker(worker);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.sliderContainer}>
          <Animated.View style={[styles.slider, { left }]} />
          <TouchableOpacity
            style={styles.clickableArea}
            onPress={personalSupport}
          >
            <Animated.Text
              style={[styles.sliderText, { transform: [{ scale }] }]}
            >
              Personal Support
            </Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clickableArea} onPress={nurseSupport}>
            <Animated.Text
              style={[styles.sliderText, { transform: [{ scale }] }]}
            >
              Nursing
            </Animated.Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text style={tw`text-center py-5 text-xl `}>Select Services</Text>
        </View>

        {isEnabled && dbWorker.isVerified ? (
          <FlatList
            data={nurseServices}
            keyExtractor={(item) => item.id}
            ListFooterComponent={() => (
              <ScrollView>
                <Button
                  onPress={onSave}
                  title="Save"
                  style={{ margin: 10, backgroundColor: "blue" }}
                />
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
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            ListFooterComponent={() => (
              <ScrollView>
                <Button
                  onPress={onSave}
                  title="Save"
                  style={{ margin: 10, backgroundColor: "blue" }}
                />
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
        )}
      </View>
    </SafeAreaView>
  );
};

export default EditServiceScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
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
    width: "48%",
    height: "90%",
    borderRadius: 10,
    backgroundColor: "#f4f4f4",
  },
});
