import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RequestsScreen from "../screens/RequestsScreen";
import AcceptScreen from "../screens/AcceptScreen";
import EditUserProfile from "../screens/EditUserProfile";
import { useAuthContext } from "../contexts/AuthContext";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ConfirmEmailScreen from "../screens/ConfirmEmailScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import NewPasswordScreen from "../screens/NewPasswordScreen";
import EditUser2Screen from "../screens/EditUser2Screen";
import { View, ActivityIndicator } from "react-native";
import EditServicesScreen from "../screens/EditServicesScreen";
import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const { dbWorker, authUser } = useAuthContext();
  const [worker, setWorker] = useState(undefined);

  const checkWorker = async () => {
    try {
      const authWorker = await Auth.currentAuthenticatedUser({
        bypassCache: true,
      });
      setWorker(authWorker);
    } catch (e) {
      setWorker(null);
    }
  };
  useEffect(() => {
    checkWorker();
  });
  if (authUser === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {worker && dbWorker ? (
        <>
          <Stack.Screen name="RequestsScreen" component={RequestsScreen} />
          <Stack.Screen name="AcceptScreen" component={AcceptScreen} />
          <Stack.Group screenOptions={{ presentation: "modal" }}>
            <Stack.Screen name="EditUser2Screen" component={EditUser2Screen} />
            <Stack.Screen
              name="EditServicesScreen"
              component={EditServicesScreen}
            />
          </Stack.Group>
        </>
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
          <Stack.Screen name="EditUserProfile" component={EditUserProfile} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Navigation;
