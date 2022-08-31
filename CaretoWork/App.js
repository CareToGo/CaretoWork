import { useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, FlatList } from 'react-native';
import { Entypo } from "@expo/vector-icons"
import orders from './assets/data/orders.json'
import srvcReqs from './assets/data/service_reqs.json'
import SingleRequest from './src/components/SingleRequest';
import RequestsScreen from "./src/screens/RequestsScreen";
import RequestDetails from "./src/screens/RequestDetails";
import Navigation from "./src/navigation";
import { NavigationContainer } from "@react-navigation/native";

const request = srvcReqs[0];

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Navigation />
        {/* <RequestDetails /> */}
        {/* <RequestsScreen /> */}
        <StatusBar style="auto" />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    // borderWidth: 2,
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0
  },
  srvcbtn: {
    color: "#FFDE59",
    backgroundColor: '#001A72',
    borderRadius: 5,
    padding: 6,
    textAlign: 'center',
    marginTop: 5
  }
});
