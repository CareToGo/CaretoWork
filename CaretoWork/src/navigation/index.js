import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RequestsScreen from "../screens/RequestsScreen";
import RequestDetails from "../screens/RequestDetails";
import AcceptScreen from "../screens/AcceptScreen";
import EditUserProfile from "../screens/EditUserProfile/EditUserProfile";
import { useAuthContext } from "../contexts/AuthContext";

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const { dbWorker } = useAuthContext();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {dbWorker ? (
        <>
          <Stack.Screen name="RequestsScreen" component={RequestsScreen} />
          <Stack.Screen name="AcceptScreen" component={AcceptScreen} />
        </>
      ) : (
        <Stack.Screen name="EditUserProfile" component={EditUserProfile} />
      )}
    </Stack.Navigator>
  );
};

export default Navigation;
