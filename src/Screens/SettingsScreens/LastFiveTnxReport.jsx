import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  PixelRatio,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,

} from "react-native"
import React, { useContext, useEffect, useState } from "react"
import axios from "axios"
import { address } from "../../Routes/addresses"
import { Row, Rows, Table } from "react-native-table-component"
import CustomHeader from "../../Components/CustomHeader"
import { COLORS } from "../../Resources/colors"
import { AppStore } from "../../Context/AppContext"
import { Dropdown } from "react-native-element-dropdown"

export default function LastFiveTnxReport() {
  const { userId, bankId, branchCode } = useContext(AppStore)
  const [lastFiveData, setLastFiveData] = useState(() => [])
  const [focusDrop, setFocusDrop] = useState(() => false)
  const [showModal, setShowModal] = useState(() => false)
  const [accountType, setAccountType] = useState(() => "")
  const [isDisabled,setIsDisabled] = useState(true)
  const [isLoading,setIsLoading] = useState(false)
  const tableHead = ["Date", "Acc No", "Name", "Dep Amt"]
  let tableData = lastFiveData

  const getLastFiveTnx = async () => {
    setIsLoading(true)
    setIsDisabled(true)
    await axios
      .post(
        address.LAST_FIVE_TRANSACTIONS,
        {
          bank_id: bankId,
          branch_code: branchCode,
          agent_code: userId,
          account_type: accountType,

        },
        {
          headers: {
            Accept: "application/json",
          },
        },
      )
      .then(res => {
        // setLastFiveData(res.data.data.msg)
        res.data.data.msg.forEach((item, i) => {
          let row = [
            new Date(item.transaction_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }),
            item.account_number,
            item.account_holder_name,
            item.deposit_amount,
          ]
          console.log("dfasjhgfisgyaf", row)

          tableData.push(...[row])
    setIsLoading(false)
    setIsDisabled(false)

        })
        if(tableData.length==0){
          ToastAndroid.showWithGravityAndOffset(
            "No data found!",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
            25,
            50,
          )
        }

        setLastFiveData(tableData)
      })
  }

  const handleSubmit = () => {
    tableData = []
    getLastFiveTnx()
  }
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
  //   useEffect(() => {
  //     tableData = []
  //     getLastFiveTnx()
  //   }, [])

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
        <Text style={styles.todayCollection}>Last Five Transactions</Text>
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
            </Table>
          )}
         
        </ScrollView>
        {/* <View>
          <TouchableOpacity
            onPress={() => printReceipt()}
            style={styles.dateButton}>
            <Text>Print</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  dateWrapper: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
    margin: 20,
  },
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
  footerText: {
    fontSize: 15,
    fontWeight: "600",
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
  },
  btnlabel:{
    color:'white',
    fontWeight:'bold'
  },
})
