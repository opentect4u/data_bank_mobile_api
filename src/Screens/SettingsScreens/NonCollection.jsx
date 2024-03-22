import { useContext, useState } from "react"
import {
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
} from "react-native"
import { AppStore } from "../../Context/AppContext"
import CustomHeader from "../../Components/CustomHeader"
import { COLORS } from "../../Resources/colors"
import { Table, Rows, Row } from "react-native-table-component"
import axios from "axios"
import { address } from "../../Routes/addresses"
import { useEffect } from "react"
import { ActivityIndicator } from "react-native"
import { Dropdown } from "react-native-element-dropdown"

const NonCollection = () => {
  const { userId, bankId, branchCode } = useContext(AppStore)
  const [accountType, setAccountType] = useState(() => "")
  const [focusDrop, setFocusDrop] = useState(() => false)
  const [nonCollectionReport, setNonCollectionReport] = useState(() => [])
  const [isDisabled,setIsDisabled] = useState(true)
  const [isLoading,setIsLoading] = useState(false)
  // const [loading, setLoading] = useState(() => true)
  const renderLabel = () => {
    if (accountType || focusDrop) {
      return (
        <Text style={[styles.label, focusDrop && { color: "blue" }]}>
          Select type
        </Text>
      )
    }
    return null
  }
  const data = [
    { label: "Daily", value: "D" },
    { label: "Loan", value: "L" },
    { label: "RD", value: "R" },
  ]
  const tableHead = ["Sl No.", "A/c No.", "Name", "Phone"]
  let tableData = nonCollectionReport

  const getNonCollectionReport = async () => {
    setIsLoading(true)
    setIsDisabled(true)
    const obj = {
      bank_id: bankId,
      branch_code: branchCode,
      agent_code: userId,
      account_type: accountType,

    }
    await axios
      .post(address.NON_COLLECTON_REPORT, obj, {
        headers: {
          Accept: "application/json",
        },
      })
      .then(res => {
    setIsLoading(false)

        res.data.success.msg.forEach((item, i) => {
          let rowArr = [
            i + 1,
            item.account_number,
            item.customer_name,
            item.mobile_no,
          ]
          console.log("NONNNNN COLLLLL ITEMMM TABLEEE=====", rowArr)
          tableData.push(...[rowArr])
        })
        if(tableData.length==0){
        setIsDisabled(false)
        // setLoading(false)
        ToastAndroid.showWithGravityAndOffset(
          "No data found!",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
          25,
          50,
        )
        }
        console.log("++++++ TABLE DATA ++++++++", tableData)
        setNonCollectionReport(tableData)
        // setLoading(false)
        setIsDisabled(false)
      })
      .catch(err => {
    setIsLoading(false)
    setIsDisabled(false)
        
        ToastAndroid.showWithGravityAndOffset(
          "Error occurred in the server",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
          25,
          50,
        )
        console.log(err)
      })
  }

  useEffect(() => {
    tableData = []
    // getNonCollectionReport()
  }, [])
  const handleSubmit = () => {
    tableData = []
    getNonCollectionReport()
  }
  console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<", tableData)
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader />
      <View
        style={{
          flex: 4,
          padding: 10,
          backgroundColor: COLORS.lightScheme.background,
          margin: 20,
          borderRadius: 10,
        }}>
        <Text style={styles.todayCollection}>Non Collection Report</Text>
        <View style={styles.dropdownContainer}>
            {renderLabel()}
            <Dropdown
              style={[styles.dropdown, focusDrop && { borderColor: "blue" }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={data}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!focusDrop ? "Select type" : "..."}
              searchPlaceholder="Search..."
              value={accountType}
              onFocus={() => setFocusDrop(true)}
              onBlur={() => setFocusDrop(false)}
              onChange={item => {
                setIsDisabled(false)

                setAccountType(item.value)
                setFocusDrop(false)
              }}
              // renderLeftIcon={() => (
              //   <AntDesign
              //     style={styles.icon}
              //     color={isFocus ? 'blue' : 'black'}
              //     name="Safety"
              //     size={20}
              //   />
              // )}
            />
          </View>
        <View>
          <TouchableOpacity
           disabled={isDisabled || isLoading}
            onPress={() => handleSubmit()}
            style={isDisabled?styles.disabledContainer: styles.dateButton}>
             {isLoading ? <ActivityIndicator color={COLORS.lightScheme.primary} size={'large'}></ActivityIndicator>:
               <Text style={styles.btnlabel}>
               SUBMIT  
              
               </Text>
              }
          </TouchableOpacity>
        </View>
       
        <ScrollView>
          {tableData.length!=0 && (
            <Table
              borderStyle={{
                borderWidth: 2,
                borderColor: COLORS.lightScheme.secondary,
                borderRadius: 10,
              }}
              style={{ backgroundColor: COLORS.lightScheme.background }}>
              <Row data={tableHead} textStyle={styles.head} />
              <Rows data={tableData} textStyle={styles.text} />

              {/* {loading ? (
                ''
                <ActivityIndicator animating={true} />
              ) : (
                <Rows data={tableData} textStyle={styles.text} />
              )
              
              } */}
            </Table>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

export default NonCollection

const styles = StyleSheet.create({
  dateButton: {
    width: "40%",
    height: 40,
    borderWidth: 2,
    borderColor: COLORS.lightScheme.primary,
    backgroundColor: COLORS.lightScheme.primary,
    margin: 15,
    borderRadius: 30,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    margin: 6,
    color: COLORS.lightScheme.onBackground,
    fontWeight: "400",
    fontSize: 10,
  },
  head: {
    margin: 6,
    color: COLORS.lightScheme.onBackground,
    fontWeight: "900",
    fontSize: 10,
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
  dropdownContainer: {
    backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  btnlabel:{
    color:'white',
    fontWeight:'bold'
  },
  disabledContainer:{
    width: "40%",
    height: 40,
    borderWidth: 2,
    borderColor: 'lightgray',
    backgroundColor: "lightgray",
    margin: 15,
    borderRadius: 30,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  }
})
