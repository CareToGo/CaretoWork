import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  SafeAreaView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import Logo from "../../../assets/C2G.png";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { Auth, Hub } from "aws-amplify";
import { DataStore } from "aws-amplify";
import { useAuthContext } from "../../contexts/AuthContext";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const EMAIL_REGEX =
  /^(?!.*(?:\.-|-\.))[^@]+@[^\W_](?:[\w-]*[^\W_])?(?:\.[^\W_](?:[\w-]*[^\W_])?)+$/;
const PHONE_REGEX = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SignInScreen = () => {
  const { authUser, setAuthUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSignInPressed = async (data) => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const auth = await Auth.signIn(data.email, data.password);
      await DataStore.clear();
      setAuthUser(auth);
    } catch (e) {
      Alert.alert("Oops", e.message);
    }
    setLoading(false);
  };
  Hub.listen("auth", async (data) => {
    if (data.payload.event === "signIn") {
      await DataStore.clear();
    }
  });

  const onForgotPasswordPressed = () => {
    navigation.navigate("ForgotPassword");
  };

  const onSignUpPressed = () => {
    navigation.navigate("SignUp");
  };

  return (
    <SafeAreaView>
      <View>
        <View style={styles.root}>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
          <CustomInput
            name="email"
            placeholder="Email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: "This is not a valid Email",
              },
            }}
          />
          <CustomInput
            name="password"
            placeholder={"Password"}
            control={control}
            secureTextEntry={true}
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password should be minimum 8 characters long",
              },
              pattern: {
                value: PASSWORD_REGEX,
                message:
                  "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number.",
              },
            }}
          />

          <CustomButton
            text={loading ? "Loading..." : "Sign In"}
            onPress={handleSubmit(onSignInPressed)}
          />
          <CustomButton
            text="Forgot Password"
            onPress={onForgotPasswordPressed}
            type="TERTIARY"
          />
          <CustomButton
            text="Sign Up"
            onPress={onSignUpPressed}
            type="TERTIARY"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    padding: "6%",
    backgroundColor: "F9FBFC",
  },
  logo: {
    width: "70%",
    maxHeight: 200,
    maxWidth: 300,
    marginTop: "21%",
  },
});
