import { useRef, useMemo } from "react";
import { Dimensions, StyleSheet, Text, View, Image } from 'react-native';
import BottomSheet from "@gorhom/bottom-sheet"
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { FlatList } from 'react-native-gesture-handler'
import srvcReqs from '../../../assets/data/service_reqs.json'
import SingleRequest from "../../components/SingleRequest";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

const srvc = srvcReqs[1];

const {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');

const RequestDetails = ( { route } ) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["16%", "85%"], []);

  const namewidth = SCREEN_WIDTH * 0.75 / srvc.Client.clientname.length;
  let namesize;
  if (namewidth <= 27) {
    namesize = namewidth;
  } else {
    namesize = 27;
  }

  function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const svcArray = srvc.Services.map(service => (
    <Text key={service.id} style={styles.srvcbtnsmall}>{service.brief}</Text>)
  );

  return (
    <GestureHandlerRootView style={{ backgroundColor: "lightblue", flex: 1 }}>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} handleIndicatorStyle={{ backgroundColor: "grey", width: 100 }}>
        <ScrollView style={{marginTop: 10, paddingHorizontal: '3%'}}>
          <View style={styles.topbrief}>
            <Text style={{ fontSize: 27, letterSpacing: 1 }}>14 min</Text>
            <FontAwesome5 name="hand-holding-medical" size={30} color="#001A72" style={{ marginHorizontal: 10 }} />
            <Text style={{ fontSize: 27, letterSpacing: 1 }}>5 km</Text>
          </View>

          <View style={styles.client}>
            <View style={styles.clientphoto}>
              <Image source={{ uri: srvc.Client.image }} style={{ width: SCREEN_WIDTH * 0.33, height: SCREEN_WIDTH * 0.33, borderRadius: SCREEN_WIDTH * 0.18 }} />
            </View>
            <View style={styles.clientinfo}>
              <Text numberOfLines={1} style={{ fontWeight: "500", fontSize: namesize, width: "100%" }}>{srvc.Client.clientname}</Text>
              <View style={{ width: "100%", flexDirection: "row", marginTop: 3, marginLeft: -5, marginBottom: 3 }}>
                <Text style={{ fontSize: 18 }}> {srvc.Client.rating.toFixed(2)}</Text>
                <Text style={{ marginLeft: -3, marginTop: 1 }}> <MaterialIcons name="star" size={21} color="#FFDE59" /> </Text>
              </View>
              <Text style={{ color: "grey" }}>{srvc.Client.address}</Text>
              <Text style={{ color: "grey" }}>{srvc.Client.contact}</Text>
            </View>
          </View>

          <View style={{ width: "100%", borderTopWidth: 1, paddingTop: 10, borderColor: "lightgrey", marginTop: 20 }}>
            <View style={{ width: "100%" }}>
              <Text numberOfLines={1} style={{ fontWeight: "500", fontSize: 21, width: "100%" }}>Request Details</Text>
            </View>
            <View style={{ width: "100%", marginTop: 2 }}>
              <Text style={{ fontSize: 15, color: "grey" }}>Allergies: {srvc.Client.allergies}</Text>
              <Text style={{ fontSize: 15, color: "grey" }}>Diagnosis: None</Text>
              <Text style={{ fontSize: 15, color: "grey" }}>{srvc.Client.gender} : {getAge(srvc.Client.DOB)} YO</Text>
              <Text style={{ fontSize: 15, color: "grey" }}>Languages: {srvc.Client.language}</Text>
              <Text style={{ fontSize: 15, color: "grey" }}>Scheduled Time: {srvc.RequestDetails.time}</Text>
            </View>
            <View style={{ width: "100%", marginTop: 20 }}>
              <Text numberOfLines={1} style={{ fontWeight: "500", fontSize: 21, width: "100%" }}>Services Requested: </Text>
            </View>
            <View style={{ width: "100%", marginTop: 2, flexDirection: "row", flexWrap: "wrap" }}>
              {svcArray}
            </View>
            <View style={{ width: "100%", marginTop: 20 }}>
              <Text numberOfLines={1} style={{ fontWeight: "500", fontSize: 21, width: "100%" }}>Client Message: </Text>
            </View>
            <View style={{ width: "100%", marginTop: 2, borderWidth: 2, borderColor:"lightgrey", borderRadius: 10, padding: 10}}>
              <Text style={{ fontSize: 15, color: "grey" }}>{srvc.RequestDetails.description}</Text>
            </View>
          </View>

          <View style={{marginTop: 20, backgroundColor:"#3FC060", width: "100%", height: 60, borderRadius: 15, textAlign:"center", justifyContent: 'center'}}>
            <Text style={{textAlign: "center", fontSize: 21, color: "white"}}>Accept Request</Text>
          </View>

          <View style={{marginTop: 20, backgroundColor:"#ff6666", width: "100%", height: 60, borderRadius: 15, textAlign:"center", justifyContent: 'center'}}>
            <Text style={{textAlign: "center", fontSize: 21, color: "white"}}>Decline Request</Text>
          </View>

          <View style={{height: 50}}>
            <Text> </Text>
          </View>

        </ScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  topbrief: {
    width: "100%",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  client: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    borderTopWidth: 1,
    paddingTop: 20,
    borderColor: "lightgrey"
  },
  clientphoto: {
    width: "40%",
    alignItems: "flex-start",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "lightgrey"
  },
  clientinfo: {
    width: "60%",
    alignItems: "flex-start",
    paddingLeft: '3%',
    borderRightColor: "lightgrey"
  },
  srvcbtnsmall: {
    color: "#FFDE59",
    backgroundColor: '#001A72',
    borderRadius: 6,
    padding: 6,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    marginHorizontal: 5,
    width: "45%",
    height: "45%",
    overflow: 'hidden',
    fontSize: SCREEN_WIDTH*0.7/20
  }
});

export default RequestDetails;