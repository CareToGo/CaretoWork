import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Entypo } from "@expo/vector-icons";
import orders from '../../../assets/data/orders.json';
import srvcReqs from '../../../assets/data/service_reqs.json'



const SingleRequest = ({ request }) => {
  const svcArray = request.Services.map(service => (
    <Text key={service.id} style={styles.srvcbtn}>{service.brief}</Text>)
  );
    
  return (
      <View style={{flexDirection:'row', borderColor:'#FFDE59', borderWidth: 2, margin: 10, borderRadius: 12, padding: 2}}>
        <Image source={{uri: request.Client.image}} style={{width: '35%', height: '100%',  borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}/>
        <View style={{marginLeft: 10, marginRight: 10, flex: 1}}>
          <Text style={{fontSize: 24, fontWeight: '600'}}>{request.Client.name}</Text>
          <Text style={{color: 'grey'}}>{request.Client.address}</Text>
          <Text style={{marginTop: 10}}>Services Requested:</Text>
          {svcArray}
        </View>
        <View style={{padding:5, backgroundColor: '#001A72', borderTopRightRadius: 10, borderBottomRightRadius: 10, marginLeft: 'auto', width: 50, alignItems: 'center', justifyContent: 'center' }}>
          <Entypo name="check" size={30} color="green" style={{margin: 'auto'}}/>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: 'center',
  },
  srvcbtn: {
    color: "#FFDE59",
    backgroundColor: '#001A72', 
    borderRadius: 5, 
    padding: 6, 
    textAlign: 'center', 
    marginTop: 5
  }
});

export default SingleRequest;