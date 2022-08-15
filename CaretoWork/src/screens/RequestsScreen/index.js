import { useRef, useMemo } from "react";
import { Text, View } from 'react-native';
import BottomSheet from "@gorhom/bottom-sheet"
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FlatList } from 'react-native-gesture-handler'
import srvcReqs from '../../../assets/data/service_reqs.json'
import SingleRequest from "../../components/SingleRequest";

const RequestsScreen = () => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["12%", "95%"], []);
  return (
    <GestureHandlerRootView style={{ backgroundColor: "lightblue", flex: 1 }}>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "600", letterSpacing: 0.5, paddingBottom: 5 }}>You're Online</Text>
          <Text>Available Requests: {srvcReqs.length}</Text>
        </View>
        <FlatList
            data={srvcReqs}
            renderItem={({ item }) => <SingleRequest request={item} />}
          />
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

export default RequestsScreen;