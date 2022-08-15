import { useRef, useMemo } from "react";
import { Text, View } from 'react-native';
import BottomSheet from "@gorhom/bottom-sheet"
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FlatList } from 'react-native-gesture-handler'
import srvcReqs from '../../../assets/data/service_reqs.json'
import SingleRequest from "../../components/SingleRequest";
import { FontAwesome5 } from "@expo/vector-icons";

const srvc = srvcReqs[3];

const RequestDetails = () => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["12%", "95%"], []);

  return (
    <GestureHandlerRootView style={{ backgroundColor: "lightblue", flex: 1 }}>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} handleIndicatorStyle={{ backgroundColor: "grey", width: 100 }}>
        <View style={{marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
          <Text style={{fontSize: 27, letterSpacing: 1}}>14 min</Text>
          <FontAwesome5 name="hand-holding-medical" size={30} color="#001A72" style={{marginHorizontal: 10}}/>
          <Text style={{fontSize: 27, letterSpacing: 1}}>5 km</Text>
        </View>
        <View>
          <Text>{srvc.Client.name}</Text>
        </View>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

export default RequestDetails;