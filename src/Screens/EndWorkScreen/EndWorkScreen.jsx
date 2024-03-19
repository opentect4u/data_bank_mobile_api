import { StyleSheet, Text, View, ScrollView, ToastAndroid, PixelRatio } from "react-native"
import { useCallback, useContext, useState } from "react"
import CustomHeader from "../../Components/CustomHeader"
import { COLORS, colors } from "../../Resources/colors"
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
} from "react-native-table-component"
import ButtonComponent from "../../Components/ButtonComponent"
import MpinComponent from "../../Components/MpinComponent"
import { AppStore } from "../../Context/AppContext"
import axios from "axios"
import { REACT_APP_BASE_URL } from "../../Config/config"
import { address } from "../../Routes/addresses"
import { StackActions, useFocusEffect } from "@react-navigation/native"
import { ActivityIndicator } from "react-native"

const EndWorkScreen = ({ navigation }) => {
  const [isButtonEnabled, setIsButtonEnabled] = useState(() => false)
  const [endScreenPassword, setEndScreenPassword] = useState(() => "")
  const [isLoading, setLoading] = useState(false)
  const {
    userId,
    agentName,
    passcode,
    deviceId,
    bankId,
    branchCode,
    totalCollection,
    receiptNumber,
    maximumAmount,
  } = useContext(AppStore)

  const tableData = [
    ["Agent Code", userId],
    ["Agent Name", agentName],
    ["Branch Code", branchCode],
    ["Max Collection", maximumAmount],
    ["Total Collection", totalCollection],
    ["Remaing Collection", maximumAmount - totalCollection],
  ]

  const endCollection = async () => {
    setLoading(true)
    const obj = {
      user_id: userId,
      password: passcode,
      device_id: deviceId,
      bank_id: bankId,
      branch_code: branchCode,
      agent_code: userId,
      coll_flag: "Y",
    }
    console.log("XXX===========DDDDD", obj)
    await axios
      .post(address.END_COLLECTION, obj, {
        headers: {
          Accept: "application/json",
        },
      })
      .then(res => {
    setLoading(false)

        // console.log("###### Preview: ", res.data)
        if (res.data.status) {
          alert("Your work has been submitted.")
          ToastAndroid.showWithGravityAndOffset(
            "Your work has been submitted.",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
            25,
            50,
          )
          setIsButtonEnabled(!isButtonEnabled)
          console.log("IF dshjklfhskdfuihsdk vtbstgubkui", res.data)
        } else {
    setLoading(false)

          alert("No collection has been done yet.")
          console.log("FI dshjklfhskdfuihsdk vtbstgubkui", res.data)
        }
      })
      .catch(err => {
    setLoading(false)

        console.log("############", err)
        alert("Collection already submitted.")
        ToastAndroid.showWithGravityAndOffset(
          "Collection already submitted.",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
          25,
          50,
        )
      })
  }

  const handleEndWorkButton = () => {
    try {
      if (endScreenPassword === passcode) {
        endCollection()
        // setIsButtonEnabled(true)
        setEndScreenPassword("")
      } else {
        alert("Invalid Password")
        setEndScreenPassword("")
      }
    } catch (error) {
      console.log(error)
      setEndScreenPassword("")
    }
  }

  // {
  //   <View style={styles.logoContainer}>
  //       <View style={{ width: '100%' }}>
  //         {/* Wellcome gretting */}
  //         <Text style={styles.grettingText}>Welcome To {'Data Bank'}</Text>
  //         {/* manual text */}
  //         <Text style={styles.manual}>Hello,{agentName}</Text>
  //       </View>
  //     </View>
  // } after CustomerHeader

  const popAction = StackActions.popToTop()

  useFocusEffect(
    useCallback(() => {
      // alert('Screen was focused')
      navigation.dispatch(popAction)

      return () => {
        // alert('Screen was unfocused')
        // // Useful for cleanup functions
      }
    }, []),
  )

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader />

      <View style={styles.container}>
        <View
          style={{
            padding: 10,
            backgroundColor: COLORS.lightScheme.onPrimary,
            margin: 20,
            borderRadius: 10,
            justifyContent: "center",
            alignContent: "center",
          }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.todayCollection}>Today's Collections</Text>
            <Table
              borderStyle={{
                borderWidth: 5,
                borderColor: COLORS.lightScheme.primary,
              }}
              style={{ backgroundColor: COLORS.lightScheme.onPrimary }}>
              <Rows data={tableData} textStyle={styles.text} />
            </Table>
            <MpinComponent
              value={endScreenPassword}
              handleChange={setEndScreenPassword}
            />
            <ButtonComponent
              title={!isLoading?"End Work":<ActivityIndicator color={COLORS.lightScheme.primary}/>}
              customStyle={{ marginTop: 10,width:'80%',marginLeft:30 }}
              handleOnpress={handleEndWorkButton}
              disabled={isLoading}
            />
          </ScrollView>
        </View>
      </View>
    </View>
  )
}

export default EndWorkScreen

const styles = StyleSheet.create({
  // logoContainer: {
  //   flex: 2,
  //   backgroundColor: COLORS.darkScheme.onSurface,
  //   borderBottomLeftRadius: 50,
  //   borderBottomRightRadius: 50,
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   paddingHorizontal: 20,
  // },
  // grettingText: {
  //   fontSize: 20,
  //   color: COLORS.lightScheme.primary,
  //   letterSpacing: 1,
  //   fontWeight: '900',
  //   alignSelf: 'center',
  // },
  // manual: {
  //   fontSize: 16,
  //   color: COLORS.darkScheme.surface,
  //   letterSpacing: 1,
  //   fontWeight: '900',
  //   alignSelf: 'center',
  // },
  text: {
    margin: 6,
    color: COLORS.lightScheme.onPrimaryContainer,
    fontWeight: "400",
    fontSize: 18,
    letterSpacing: 1,
  },
  todayCollection: {
    backgroundColor: COLORS.lightScheme.primary,
    color: COLORS.lightScheme.onPrimary,
    fontWeight: "600",
    textAlign: "center",
    fontSize: PixelRatio.roundToNearestPixel(22),
    padding: PixelRatio.roundToNearestPixel(5),
    marginBottom: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
})
