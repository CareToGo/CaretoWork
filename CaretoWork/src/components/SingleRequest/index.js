import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import orders from '../../../assets/data/orders.json';
import srvcReqs from '../../../assets/data/service_reqs.json'

const {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');

const SingleRequest = ({ request }) => {
  const svcArray = request.Services.map(service => (
    <Text key={service.id} style={styles.srvcbtn}>{service.brief}</Text>)
  );
  const navigation = useNavigation();
  
  const pressHandler = () => {
    navigation.navigate('RequestDetails', request);
    console.log(request);
  }

  return (
      <Pressable style={styles.singlereq} onPress={pressHandler}>
        <Image source={{uri: request.Client.image}} style={{width: '35%', height: '100%',  borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}/>
        <View style={{marginLeft: 10, marginRight: 10, flex: 1, width: '50%'}}>
          <Text style={{fontSize: 24, fontWeight: '600'}}>{request.Client.name}</Text>
          <Text style={{color: 'grey'}}>{request.Client.address}</Text>
          <Text style={{marginTop: 10, fontSize: SCREEN_WIDTH*0.75/19}}>Services Requested:</Text>
          {svcArray}
        </View>
        <View style={{padding:5, backgroundColor: '#001A72', borderTopRightRadius: 10, borderBottomRightRadius: 10, marginLeft: 'auto', width: '15%', alignItems: 'center', justifyContent: 'center' }}>
          <Entypo name="check" size={30} color="green" style={{margin: 'auto'}}/>
        </View>
      </Pressable>
  );
}

const styles = StyleSheet.create({
  srvcbtn: {
    color: "#FFDE59",
    backgroundColor: '#001A72', 
    borderRadius: 5, 
    padding: 6, 
    textAlign: 'center', 
    marginTop: 5,
    overflow: 'hidden',
    fontSize: SCREEN_WIDTH*0.7/20
  },
  singlereq: {
    flexDirection:'row', 
    borderColor:'#FFDE59', 
    borderWidth: 1, 
    margin: 9, 
    borderRadius: 12, 
    padding: 3
  }
});

export default SingleRequest;