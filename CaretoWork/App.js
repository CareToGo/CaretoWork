import { StatusBar } from "expo-status-bar";
import { StyleSheet, KeyboardAvoidingView } from "react-native";
import Navigation from "./src/navigation";
import { NavigationContainer } from "@react-navigation/native";
import { Amplify } from "aws-amplify";
import awsconfig from "./src/aws-exports";
import AuthContextProvider from "./src/contexts/AuthContext";
import OrderContextProvider from "./src/contexts/OrderContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

Amplify.configure({
  ...awsconfig,
  Analytics: {
    disabled: true,
  },
});

function App() {
  return (
    <NavigationContainer>
      <GestureHandlerRootView style={styles.container}>
        <AuthContextProvider>
          <OrderContextProvider>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
              keyboardVerticalOffset={Platform.OS === "ios" ? -64 : 0}
            >

              <Navigation />
            </KeyboardAvoidingView>
          </OrderContextProvider>
        </AuthContextProvider>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingTop: 0,
  },
  srvcbtn: {
    color: "#FFDE59",
    backgroundColor: "#001A72",
    borderRadius: 5,
    padding: 6,
    textAlign: "center",
    marginTop: 5,
  },
});

export default App;
