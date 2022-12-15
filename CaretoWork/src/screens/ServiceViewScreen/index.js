import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import tw from "tailwind-react-native-classnames";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ServiceViewScreen = () => {
  const [services, setServices] = useState([]);
  const { dbWorker } = useAuthContext();

  useEffect(() => {
    const nS = JSON.parse(dbWorker.nursingServices);
    const pS = JSON.parse(dbWorker.pswServices);
    setServices([...nS, ...pS]);
  }, []);

  const navigation = useNavigation();
  const Split = () => {
    console.log(services.length == 0);
    if (services.length == 0) {
      return (
        <View>
          <Text>You don't have any Services Selected</Text>
        </View>
      );
    }
    if (services.length > 0) {
      return (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          ListHeaderComponentStyle={{
            alignItems: "center",
            justifyContent: "center",
          }}
          ItemSeparatorComponent={() => (
            <View style={tw` border-t border-gray-200 flex-shrink py-0`} />
          )}
          renderItem={({ item: { id, name, description, price }, item }) => (
            <View style={tw`flex-row items-center justify-between p-5`}>
              <View style={tw`w-4/5`}>
                <Text style={tw`font-semibold text-lg`}>{name}</Text>
                <Text style={tw`text-gray-500`}>{description}</Text>
              </View>
            </View>
          )}
        />
      );
    }
  };
  return (
    <SafeAreaView>
      <View style={tw`flex-row p-2`}>
        <Text style={styles.title}>Selected Services</Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate("EditServicesScreen")}
        style={{ position: "absolute", right: 0 }}
      >
        <Feather name="edit" size={26} color="#001A72" />
      </TouchableOpacity>
      <Split />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 27,
    fontWeight: "300",
    textAlign: "center",
    margin: 10,
  },
});

export default ServiceViewScreen;
