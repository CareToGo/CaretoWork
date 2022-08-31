import { useRef, memo, useMemo, useCallback, useState } from "react";
import { Text, View, Dimensions, useWindowDimensions, PermissionsAndroid } from 'react-native';
import BottomSheet from "@gorhom/bottom-sheet"
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FlatList } from 'react-native-gesture-handler'
import srvcReqs from '../../../assets/data/service_reqs.json'
import SingleRequest from "../../components/SingleRequest";
import MapView, { Marker } from "react-native-maps";
import { FontAwesome5 } from '@expo/vector-icons';

const RequestsScreen = () => {
  const bottomSheetRef = useRef(null);
  const { height, width } = useWindowDimensions();
  const snapPoints = useMemo(() => ["16%", "85%"], []);

  return (
    <GestureHandlerRootView style={{ backgroundColor: "lightblue", flex: 1 }}>
      <MapView showsUserLocation={true} followsUserLocation={true} style={{ height, width }}>
        <Marker title={"BelairCare"} description={"BelairCare Medical Company"} coordinate={{ latitude: 43.648411, longitude: -79.376472 }}>
          <View style={{backgroundColor:"green", paddingVertical: 4, paddingHorizontal: 3, borderRadius: 20}}>
            <FontAwesome5 name="hand-holding-medical" size={12} color="white" />
          </View>
        </Marker>
      </MapView>

      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
        <View style={{ alignItems: "center", marginBottom: 20, paddingTop: 10 }}>
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
