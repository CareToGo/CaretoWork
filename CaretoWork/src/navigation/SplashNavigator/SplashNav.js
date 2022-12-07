import {
    Text,
    Dimensions,
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthContext } from "../../contexts/AuthContext";
import { useEffect } from "react";
import SplashScreen from "../../screens/SplashScreen";
import RequestsScreen from "../../screens/RequestsScreen";
import AcceptScreen from "../../screens/AcceptScreen";
import EditUser2Screen from "../../screens/EditUser2Screen"
import EditServicesScreen from "../../screens/EditServicesScreen"
import EditUserProfile from "../../screens/EditUserProfile";
import { facebookSignInButton } from "aws-amplify";

const Stack = createNativeStackNavigator();

const SplashNav = () => {
    const { authUser, dbWorker, loading, queryWorker, setLoading } = useAuthContext();

    useEffect(() => {
        queryWorker(authUser.attributes.sub);
    }, []);

    useEffect(() => {
        const timeId = setTimeout(() => {
            setLoading(false)
            // console.log('set to false')
        }, 2000)
        return () => {
            clearTimeout(timeId)
        }
    }, []);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            { !loading ? ( dbWorker ? (
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
                <Stack.Screen
                    name="FirstTimeEditPage"
                    component={EditUserProfile}
                    options={{
                        title: "",
                        headerStyle: {
                            backgroundColor: "#FFFFFF",
                        },
                        headerShadowVisible: false,
                        headerTitleAlign: "left",
                        headerShown: false
                    }}
                />
            )) : (
                <Stack.Screen
                    name="SplashingScreen"
                    component={SplashScreen}
                />
            )}
        </Stack.Navigator>
    );
};

export default SplashNav;

const styles = StyleSheet.create({
    loadingScreen: {
        backgroundColor: "#FFFFFF",
        borderRadius: 0,
        width: "100%",
        height: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
    },
});