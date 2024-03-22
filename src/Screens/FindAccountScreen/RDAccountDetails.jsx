import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  Alert,
  Pressable,
  ToastAndroid,
} from "react-native"
import { useContext, useState, useEffect, useCallback } from "react"
import { COLORS, colors } from "../../Resources/colors"
import CustomHeader from "../../Components/CustomHeader"
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
} from "react-native-table-component"
import InputComponent from "../../Components/InputComponent"
import ButtonComponent from "../../Components/ButtonComponent"
import mainNavigationRoutes from "../../Routes/NavigationRoutes"
import { AppStore } from "../../Context/AppContext"
import { StackActions, useFocusEffect } from "@react-navigation/native"
import CancelButtonComponent from "../../Components/CancelButtonComponent"
const RDAccountDetails = ({ navigation, route }) => {
  const [collectionMoney, setCollectionMoney] = useState(() => 0)
  const {
    modifiedAt,
    todayDateFromServer,
    holidayLock,
    getFlagsRequest,
    collectionFlag,
    endFlag,
    transDt,
    allowCollectionDays
  } = useContext(AppStore)

  const { item } = route.params

  const tableData = [
    [
      "Account Type",
      item?.acc_type == "D"
        ? "Daily"
        : item?.acc_type == "R"
        ? "RD"
        : item?.acc_type == "L"
        ? "Loan"
        : "",
    ],
    ["Account No.", item?.account_number],
    ["Name", item?.customer_name],
    ["Mobile No.", item?.mobile_no],
    ["Opening date", new Date(item?.opening_date).toLocaleDateString("en-GB")],
    ["Current Balance", item?.current_balance],
  ]

  useEffect(() => {
    getFlagsRequest()
  }, [])

  const handlePreviewData = () => {
    if (!collectionMoney || collectionMoney <= 0) {
      ToastAndroid.showWithGravityAndOffset(
        "Invalid Ammount",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
        25,
        50,
      )
      return
    }
    // setCollectionMoney(0)
    navigation.navigate(mainNavigationRoutes.RDAccountPreview, {
      item: item,
      money: collectionMoney,
    })
  }
  const checkDayLock = () => {
    let currentDate = new Date(todayDateFromServer.toISOString().slice(0, 10))
    console.log("CURRRRR DATEE", currentDate)
    let trans_dt = new Date(transDt.toISOString().slice(0, 10))
    console.log("MODDDD DATEsssssss", trans_dt)
    let newTrans_dt = trans_dt.setDate(trans_dt.getDate() + parseInt(allowCollectionDays))
    newTrans_dt = new Date(newTrans_dt).toISOString().slice(0, 10)
    // console.log('NNNNEEEWWWWW TRANCE DT', new Date(newTrans_dt).toISOString().slice(0, 10), trans_dt);

    var date_dif = Math.abs(new Date() - new Date(transDt))
    date_dif = date_dif / (1000 * 60 * 60 * 24)
    // console.log('Police case kore6ile', date_dif, 'llala', allowCollectionDays);

    // let afterAddingHolidayLockDays = modifiedAtDate.getDate() + 1
    // newModifiedDate.setDate(modifiedAtDate.getDate() + holidayLock)
    // console.log("HOLIIIIDDDAAAAYYYYY _+++++++>>>", holidayLock)
    
    // return newTrans_dt >= currentDate
    return date_dif < allowCollectionDays
  }
  const checkHolidayLock = () => {
    let currentDate = new Date(todayDateFromServer.toISOString().slice(0, 10))
    console.log("CURRRRR DATEE", currentDate)
    let modifiedAtDate = new Date(modifiedAt.toISOString().slice(0, 10))
    console.log("MODDDD DATE", modifiedAtDate)
    let newModifiedDate = new Date()

    // let afterAddingHolidayLockDays = modifiedAtDate.getDate() + 1
    newModifiedDate.setDate(modifiedAtDate.getDate() + holidayLock)
    console.log("HOLIIIIDDDAAAAYYYYY _+++++++>>>", holidayLock)

    return newModifiedDate >= currentDate
  }

  console.log("CHECKKK HOLIDAAAY LOCKKK fun()", checkDayLock())

  const checkIsCollectionEnded = () => {
    if (collectionFlag == "Y" && endFlag == "N") return false
    else if (collectionFlag == "N" && endFlag == "Y") return true
  }

  // console.log("CHECKKK COLLL ENDEDDD ========>>>>>", checkIsCollectionEnded())

  return (
    <View>
      <CustomHeader />
      <View
        style={{
          backgroundColor: COLORS.lightScheme.background,
          height: "100%",
          padding: 10,
        }}>
        <ScrollView keyboardShouldPersistTaps={"handled"}>
          <Text style={styles.info}>RD Account Info</Text>
          {/* Table Component */}
          <View style={styles.tableConatiner}>
            <Table
              borderStyle={{
                borderWidth: 2,
                borderColor: COLORS.lightScheme.primary,
              }}
              style={{ backgroundColor: COLORS.lightScheme.onPrimary }}>
              <Rows data={tableData} textStyle={styles.text} />
            </Table>
          </View>
          {/* Input Field */}
          <View style={styles.inputContainer}>
            <InputComponent
              keyboardType={"numeric"}
              placeholder={"Enter Valid Amount"}
              label={"Collection Amount"}
              value={collectionMoney}
              handleChange={setCollectionMoney}
              autoFocus={true}
            />
            <View style={styles.buttonContainer}>
              <CancelButtonComponent
                title={"Back"}
                customStyle={{
                  marginTop: 10,
                  marginRight:10,
                  backgroundColor: 'white',
                  colors:'red',
                  width: "40%",
                }}
                handleOnpress={() => {
                  setCollectionMoney(0)
                  navigation.goBack()
                }}
              />
              {!checkIsCollectionEnded() && checkDayLock()? (
                <ButtonComponent
                  title={"Preview / Save"}
                  customStyle={{ marginTop: 10, width: "50%" }}
                  handleOnpress={handlePreviewData}
                />
              ) : (
                <ButtonComponent
                  title={"Preview / Save"}
                  customStyle={{ marginTop: 10, width: "50%" }}
                  handleOnpress={handlePreviewData}
                  disabled={true}
                />
              )}

              {/* <ButtonComponent
              title={'Preview / Save'}
              customStyle={{ marginTop: 10, width: '60%' }}
              handleOnpress={handlePreviewData}
            /> */}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

export default RDAccountDetails

const styles = StyleSheet.create({
  // text: {
  //   margin: 6,
  //   color: COLORS.lightScheme.onBackground,
  //   fontWeight: '400',
  //   fontSize: 18,
  // },
  text: {
    margin: 6,
    color: COLORS.lightScheme.onBackground,
    fontWeight: "400",
    fontSize: 18,
  },
  head: {
    margin: 6,
    color: COLORS.lightScheme.onBackground,
    fontWeight: "900",
    fontSize: 12,
  },
  info: {
    color: COLORS.lightScheme.onPrimary,
    textAlign: "center",
    fontSize: 22,
    letterSpacing: 5,
    backgroundColor: COLORS.lightScheme.primary,
    borderRadius: 5,
    marginBottom: 5,
    paddingVertical: 5,
    fontWeight: "600",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  inputContainer: {
    padding:20,
    marginVertical: 10,
    // padding: 10,
    backgroundColor: COLORS.lightScheme.onPrimary,
    borderRadius: 20,
    borderColor:COLORS.lightScheme.primary,
    borderWidth:0.8,
    elevation:10
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  tableConatiner: {
    padding: 10,
    backgroundColor: COLORS.lightScheme.onPrimary,
    borderRadius: 5,
  },
})
