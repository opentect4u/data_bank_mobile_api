import { FlatList, Image, StyleSheet, Text, View } from "react-native"
import { useContext } from "react"
import { COLORS, colors } from "../../Resources/colors"
import CustomHeader from "../../Components/CustomHeader"
import { Table, Rows } from "react-native-table-component"
import { icon } from "../../Resources/Icons"
import { AppStore } from "../../Context/AppContext"
const Profile = () => {
  const { userId, agentName, agentEmail, agentPhoneNumber, maximumAmount } =
    useContext(AppStore)

  const tableData = [
    ["Agent Code", userId],
    // ['Agent Name', agentName],
    ["Email", agentEmail],
    ["Mobile No.", agentPhoneNumber],
    ["Maximum Limit (₹)", maximumAmount],
  ]
  return (
    <View style={{ backgroundColor: COLORS.lightScheme.background }}>
      <CustomHeader />
      <View style={styles.logoContainer}>
        <View style={styles.introText}>
          {/* Wellcome gretting */}
          <Text style={styles.containerText}>{`Hello! ${agentName}`}</Text>
         
        </View>
       
      </View>
      <Image
            source={{
              uri: "https://cdn.pixabay.com/photo/2015/03/04/22/35/avatar-659651_640.png",
            }}
            style={styles.image}
          />
     
      <View
        style={styles.listView}>
        {/* <Table style={{ backgroundColor: COLORS.lightScheme.onTertiary }}>
          <Rows data={tableData} textStyle={styles.text} />
        </Table> */}
        <View style={styles.profileContainer}>
        <View style={styles.profileView}>
         <Text style={styles.title}>Agent Code</Text>
         <Text style={styles.content}>{userId}</Text>
      </View>
      <View style={styles.profileView}>
         <Text style={styles.title}>Email</Text>
         <Text style={styles.content}>{agentEmail}</Text>
      </View>
      <View style={styles.profileView}>
         <Text style={styles.title}>Mobile No.</Text>
         <Text style={styles.content}>{agentPhoneNumber}</Text>
      </View>
      <View style={styles.profileView}>
         <Text style={styles.title}>Maximum Limit (₹)</Text>
         <Text style={styles.content}>{maximumAmount}</Text>
      </View>
        </View>
      
      {/* <hr/> */}
    </View>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  nameContainer: {
    flex:1,
    margin: 20,
    padding: 10,
    backgroundColor: "white",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    borderTopRightRadius:50
  },
  profileContainer:{
    position:'relative',
    // top:-80
   
  },
  containerText: {
    fontSize: 20,
    color: COLORS.lightScheme.onPrimary,
  },
  introText:{
    flexDirection:"row",
    justifyContent:'center',
    marginTop:10
  },
  profileView:{
    width:'100%',
    borderBottomColor:'gray',
    borderBottomWidth:0.5,
    paddingBottom:7,
    paddingTop:15,
  },
  listView:{
    backgroundColor: COLORS.lightScheme.background,
    height: "100%",
    padding: 20,
    marginTop:-80
  },
  text: {
    color: COLORS.lightScheme.onBackground,
    fontWeight: "600",
    borderBottomColor: COLORS.lightScheme.secondary,
    borderBottomWidth: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  title:{
    fontWeight:'bold',
    color:COLORS.lightScheme.primary,
    fontSize:16
  },
  content:{
    color:'gray',
    fontSize:20
  },
  logoContainer: {
   borderBottomRightRadius:30,
   borderBottomLeftRadius:30,
    backgroundColor: COLORS.lightScheme.primary,
    position:'relative',
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
 
    paddingHorizontal: 20,
    height: 150,
    overflow:'none'
  },

  image: {
    height: 150,
    width: 150,
    backgroundColor: 'white',
    borderColor:COLORS.lightScheme.primary,
    borderWidth:6,
    borderRadius: 100,
    alignSelf: "center",
    bottom:90
  },
})
