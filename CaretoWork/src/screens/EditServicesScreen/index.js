import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { DataStore } from "aws-amplify";
import { NurseService, Worker } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { PSWService } from "../../models";
import tw from "tailwind-react-native-classnames";

const { width, height } = Dimensions.get("screen");

const EditServiceScreen = () => {
  const { dbWorker, setDbWorker } = useAuthContext();
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [nurseServices, setNurseServices] = useState([]);
  const [nurseSelected, setNurseSelected] = useState([]);
  const navigation = useNavigation();

  const [isEnabled, setIsEnabled] = useState(false);

  const queryWorker = async (arg) => {
    const subscription = DataStore.observeQuery(Worker, (worker) =>
      worker.sub("eq", arg)
    ).subscribe((snapshot) => {
      const { items } = snapshot;
      setDbWorker(items[0]);
      console.log(items[0]);
    });
  };

  const personalSupport = () => {
    setIsEnabled(false);
  };

  const nurseSupport = () => {
    setIsEnabled(true);
  };

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
    queryWorker(dbWorker.sub);
  }, []);

  const onSave = async () => {
    await updateWorker();
    navigation.goBack();
  };

  const updateWorker = async () => {
    Object.keys(selected).forEach(function (key) {
      if (selected[key] == false) {
        delete selected[key];
      }
    });
    const keys = Object.keys(selected);

    let service_array = [];
    service_array = services.filter((g) => keys.includes(g.id)).map((g) => g);
    console.log(service_array);
    let nurse_service_array = [];
    nurse_service_array = nurseServices
      .filter((g) => keys.includes(g.id))
      .map((g) => g);
    console.log(nurse_service_array);
    try {
      console.log(dbWorker);
      const worker = await DataStore.save(
        Worker.copyOf(dbWorker, (updated) => {
          updated.pswServices = JSON.stringify(service_array);
          updated.nursingServices = JSON.stringify(nurse_service_array);

          // updated._version = parseInt(dbUser.ver);
          // updated.ver = parseInt(dbUser.ver + 1);
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
        {isEnabled && dbWorker.isVerified ? (
          <FlatList
            data={nurseServices}
            keyExtractor={(item) => item.id}
            ListHeaderComponentStyle={{
              alignItems: "center",
              justifyContent: "center",
            }}
            ListHeaderComponent={() => (
              <View style={styles.sliderContainer}>
                <TouchableOpacity
                  style={styles.clickableArea}
                  onPress={personalSupport}
                >
                  <Text style={styles.sliderText}>Personal Support</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.clickableArea}
                  onPress={nurseSupport}
                >
                  <Text style={styles.sliderText}>Nursing</Text>
                  <View
                    style={{ height: 1, borderWidth: 0.5, width: 60 }}
                  ></View>
                </TouchableOpacity>
              </View>
            )}
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
                style={tw`flex-row items-center justify-between p-5 ${selected[id] && "bg-gray-200"
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
            ListHeaderComponentStyle={{
              alignItems: "center",
              justifyContent: "center",
            }}
            ListHeaderComponent={() => (
              <View style={styles.sliderContainer}>
                <TouchableOpacity
                  style={styles.clickableArea}
                  onPress={personalSupport}
                >
                  <Text style={styles.sliderText}>Personal Support</Text>
                  <View style={{ height: 1, borderWidth: 0.5, width: 130 }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.clickableArea}
                  onPress={nurseSupport}
                >
                  <Text style={styles.sliderText}>Nursing</Text>
                </TouchableOpacity>
              </View>
            )}
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
                style={tw`flex-row items-center justify-between p-5 ${selected[id] && "bg-gray-200"
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
      <Button
        onPress={onSave}
        title="Save"
        style={{ margin: 10, backgroundColor: "blue" }}
      />
    </SafeAreaView>
  );
};

export default EditServiceScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderContainer: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  clickableArea: {
    width: "50%",
    height: 60,
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
