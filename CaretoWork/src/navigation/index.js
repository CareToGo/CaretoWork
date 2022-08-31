import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RequestsScreen from "../screens/RequestsScreen";
import RequestDetails from "../screens/RequestDetails";


const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="RequestsScreen" component={RequestsScreen} />
      <Stack.Screen name="RequestDetails" component={RequestDetails} />
    </Stack.Navigator>
  )

}

export default Navigation;