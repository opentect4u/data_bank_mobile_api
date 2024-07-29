import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  Pressable,
  ToastAndroid,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native"
import { useContext, useEffect, useMemo, useState } from "react"
import { COLORS, colors } from "../../Resources/colors"
import CustomHeader from "../../Components/CustomHeader"
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
} from "react-native-table-component"
import RazorpayCheckout from "react-native-razorpay"
import RadioGroup from "react-native-radio-buttons-group"
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer"
import InputComponent from "../../Components/InputComponent"
import ButtonComponent from "../../Components/ButtonComponent"
import axios from "axios"
import { AppStore } from "../../Context/AppContext"
import { REACT_APP_BASE_URL } from "../../Config/config"
import mainNavigationRoutes from "../../Routes/NavigationRoutes"
import { StackActions } from "@react-navigation/native"
import { address } from "../../Routes/addresses"
import { logo } from "../../Resources/ImageStrings/logo"
import { gle } from "../../Resources/ImageStrings/gle"
import { glej } from "../../Resources/ImageStrings/glej"
import { Alert } from "react-native"
import CancelButtonComponent from "../../Components/CancelButtonComponent"
// import logoCut from "../../Resources/Images/logo_cut.png"
import razor from "../../Resources/Images/razorpay.webp"

import RNEzetapSdk from "react-native-ezetap-sdk"

const AccountPreview = ({ navigation, route }) => {
  const [isLoading, setLoading] = useState(false)
  const [receiptNumber, setReceiptNumber] = useState(() => "")
  const [isSaveEnabled, setIsSaveEnabled] = useState(() => false)
  var todayDT
  const {
    id,
    userId,
    maximumAmount,
    getTotalDepositAmount,
    totalDepositedAmount,
    todayDateFromServer,
    agentName,
    bankName,
    branchName,
    totalCollection,
    login,
    allowCollectionDays,
    secAmtType,
  } = useContext(AppStore)
  const { item, money } = route.params
  const tableData = [
    [
      "A/c Type",
      item?.acc_type == "D"
        ? "Daily"
        : item?.acc_type == "R"
        ? "RD"
        : item?.acc_type == "L"
        ? "Loan"
        : "",
    ],
    ["A/c No.", item?.account_number],
    ["Name", item?.customer_name],
    ["Mobile No.", item?.mobile_no],
    ["Opening Date", new Date(item?.opening_date).toLocaleDateString("en-GB")],
    [
      "Previous Transaction Date",
      item?.last_trns_dt
        ? new Date(item?.last_trns_dt).toLocaleDateString("en-GB")
        : "No available date",
    ],
    ["Previous Balance", item?.current_balance],
  ]

  const netTotalSectionTableData = [
    ["Tnx. Date", new Date(todayDateFromServer).toLocaleDateString("en-GB")],
    ["Deposit Amt.", money],
    ["Current Balance", item?.current_balance + parseFloat(money)],
  ]

  const radioButtons = useMemo(
    () => [
      {
        id: "1", // acts as primary key, should be unique and non-empty string
        label: "Receive Cash",
        value: "C",
      },
      {
        id: "2",
        label: "Pay Online",
        value: "O",
      },
    ],
    [],
  )

  const [selectedId, setSelectedId] = useState(() => "1")

  const resetAction = StackActions.popToTop()

  const sendCollectedMoney = async () => {
    setLoading(true)
    todayDT = new Date().toISOString()
    const obj = {
      bank_id: item?.bank_id,
      branch_code: item?.branch_code,
      agent_code: userId,
      account_holder_name: item?.customer_name,
      transaction_date: todayDT,
      account_type: item?.acc_type,
      product_code: item?.product_code,
      account_number: item?.account_number,
      total_amount: item?.current_balance + parseFloat(money),
      deposit_amount: parseFloat(money),
      collection_by: id,
      sec_amt_type: secAmtType,
      total_collection_amount: totalCollection,
      // flag:'D'
    }
    console.log("===========", obj)
    await axios
      .post(address.TRANSACTION, obj, {
        headers: {
          Accept: "application/json",
        },
      })
      .then(res => {
        console.log("result " + res.data.status)
        if (res.data.status) {
          setLoading(false)
          Alert.alert("Receipt No.", `Receipt No is ${res.data.receipt_no}`, [
            {
              text: "Okay",
              onPress: () => console.log("Receipt generated."),
            },
          ])
          setReceiptNumber(res.data.receipt_no)
          setIsSaveEnabled(false)
          printReceipt(res.data.receipt_no)
          navigation.dispatch(resetAction)
        } else {
          setLoading(false)
          console.log("result else gggggggggggggggggg", res.data)

          alert("Data already submitted. Please upload new dataset.")
          ToastAndroid.showWithGravityAndOffset(
            res.data,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
            25,
            50,
          )
        }
      })
      .catch(err => {
        setLoading(false)

        alert(`An error occurred! ${err}`)
        ToastAndroid.showWithGravityAndOffset(
          err,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
          25,
          50,
        )
      })
  }

  async function printReceipt(rcptNo) {
    try {
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER,
      )
      await BluetoothEscposPrinter.printText(bankName, { align: "center" })
      await BluetoothEscposPrinter.printText("\r\n", {})
      await BluetoothEscposPrinter.printText(branchName, { align: "center" })
      await BluetoothEscposPrinter.printText("\r\n", {})

      await BluetoothEscposPrinter.printText("RECEIPT", {
        align: "center",
      })

      await BluetoothEscposPrinter.printText("\r", {})

      // await BluetoothEscposPrinter.printPic(logo, { width: 300, align: "center", left: 30 })

      await BluetoothEscposPrinter.printText(
        "-------------------------------",
        {},
      )
      await BluetoothEscposPrinter.printText("\r\n", {})

      let columnWidths = [11, 1, 18]

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["AGENT NAME", ":", agentName.toString()],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
          "RCPT DATE",
          ":",
          (
            new Date(todayDT).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }) +
            ", " +
            new Date(todayDT).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          ).toString(),
        ],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["RCPT NO", ":", rcptNo.toString().substring(0, 6)],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["ACC NO", ":", (item?.account_number).toString()],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["NAME", ":", item?.customer_name.toString()],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["OPEN BAL", ":", (item?.current_balance).toString()],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        ["COLL AMT", ":", money.toString()],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
          "CLOSE BAL",
          ":",
          parseFloat(item?.current_balance + parseFloat(money)).toString(),
        ],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
          "PRV TNX DT",
          ":",
          item?.last_trns_dt
            ? new Date(item?.last_trns_dt)
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })
                .toString()
            : "No date.",
        ],
        {},
      )

      await BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
          "ACC OPN DT",
          ":",
          new Date(item?.opening_date)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })
            .toString(),
        ],
        {},
      )

      // await BluetoothEscposPrinter.printText("\r\n", {})

      // await BluetoothEscposPrinter.printText("\r\n", {})
      await BluetoothEscposPrinter.printText(
        "---------------X---------------",
        {},
      )

      await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {})
    } catch (e) {
      console.log(e.message || "ERROR")
      // ToastAndroid.showWithGravityAndOffset(
      //   "Printer not connected.",
      //   ToastAndroid.SHORT,
      //   ToastAndroid.CENTER,
      //   25,
      //   50,
      // )
    }
  }

  const handleSave = () => {
    getTotalDepositAmount()
    // console.log("##$$$$###$$$", maximumAmount, money, totalDepositedAmount)
    // console.log("##$$$$+++++###$$$", money + totalDepositedAmount)
    // console.log("##$$$$+++++###$$$", typeof money, typeof totalDepositedAmount)
    // console.log("##$$$$+++++###$$$", parseFloat(money) + totalDepositedAmount)

    if (secAmtType == "M") {
      console.log("MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM")
      console.log("TTTTTYYYYYPPPPPEEEEE", maximumAmount)
      console.log("TTTTTYYYYYPPPPPEEEEE", allowCollectionDays)
      console.log("##$$$$###$$$", maximumAmount * allowCollectionDays)
      console.log("##$$$$+++++###$$$", parseFloat(money) + totalDepositedAmount)
      console.log(
        "##$$$$+++++###$$$ totalDepositedAmount",
        totalDepositedAmount,
      )
      console.log("##$$$$+++++###$$$ totalCollection", totalCollection)

      if (maximumAmount >= parseFloat(money) + totalDepositedAmount) {
        console.log("MMMMMMMMMMMMMMMM")
        setIsSaveEnabled(true)
        sendCollectedMoney()
        // maximumAmount -= money
        login()
      } // M
      else {
        ToastAndroid.showWithGravityAndOffset(
          "Your collection quota has been exceeded.",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
          25,
          50,
        )
      }
    } else if (secAmtType == "A") {
      console.log("AAAAAAAAAAAAAAAAAA")

      console.log("TTTTTYYYYYPPPPPEEEEE maximumAmount", maximumAmount)
      console.log(
        "TTTTTYYYYYPPPPPEEEEE allowCollectionDays",
        allowCollectionDays,
      )
      console.log(
        "##$$$$###$$ maximumAmount * allowCollectionDays",
        maximumAmount * allowCollectionDays,
      )
      console.log(
        "##$$$$+++++###$$$ (money) + totalDepositedAmount",
        parseFloat(money) + totalDepositedAmount,
      )

      console.log(
        "##$$$$+++++###$$$ totalDepositedAmount",
        totalDepositedAmount,
      )
      console.log("##$$$$+++++###$$$ totalCollection", totalCollection)

      if (maximumAmount >= parseFloat(money) + totalCollection) {
        setIsSaveEnabled(true)
        sendCollectedMoney()
        // maximumAmount -= money
        login()
      } // A
      else {
        ToastAndroid.showWithGravityAndOffset(
          "Your collection quota has been exceeded.",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
          25,
          50,
        )
      }
    }
  }

  // useEffect(() => {
  //   getTotalDepositAmount()
  // }, [])

  // const sendFinalCollectedMoney = () => {
  //   getTotalDepositAmount()

  //   console.log("Total Deposited Amount", totalDepositedAmount)
  // }

  const handleRazorpayClient = async () => {
    let json = {
      appKey: "a40c761a-b664-4bc6-ab5a-bf073aa797d5",
      username: "9903044748",
      amount: +money,
      customerMobileNumber: "8910792003",
      externalRefNumber: "123456",
      externalRefNumber2: "534534",
      externalRefNumber3: "54345",
      accountLabel: "AC1",
      customerEmail: "soumyadeep.mondal@synergicsoftek.in",
      pushTo: { deviceId: "1492621778|ezetap_android" },
      mode: "UPI",
    }

    // Convert json object to string
    let jsonString = JSON.stringify(json)

    // await RNEzetapSdk.initialize(jsonString)
    //   .then(res => {
    //     console.log(">>>>>>>>>>>>>>>>>", res)
    //   })
    //   .catch(err => {
    //     console.log("<<<<<<<<<<<<<<<<<", err)
    //   })

    var res = await RNEzetapSdk.prepareDevice()
    console.log(res)

    await RNEzetapSdk.pay(jsonString)
      .then(res => {
        console.log(">>>>>>>>>>>>>>>>>", res)

        // if (res?.status == "success") {
        //   handleSave()
        //   Alert.alert("Txn ID", res?.txnId)
        // } else {
        //   Alert.alert("Error in Tnx", res?.error)
        // }
      })
      .catch(err => {
        console.log("<<<<<<<<<<<<<<<<<", err)
      })
  }

  const init = async () => {
    // var initPayloads =
    //   '{"loginType":"USERID","merchantName":"SYNERGIC_SOFTEK_SOLUTIONS","prodAppKey":"a40c761a-b664-4bc6-ab5a-bf073aa797d5","userName":' +
    //   "9903044748" +
    //   ',"password":' +
    //   "123456Q" +
    //   ',"currencyCode":"INR","appMode":"DEV11","captureSignature":"true","prepareDevice":"false","appId":"ezetap_android","versionName":"8.6.59","versionCode":"279"}'
    // var response = await RNEzetapSdk.initialize(initPayloads)
    // console.log("YYYYYYYYYYYYYYYYYYYYYY", response)
    // var jsonData = JSON.parse(response)

    var withAppKey =
      '{"userName":' +
      "9903044748" +
      ',"demoAppKey":"a40c761a-b664-4bc6-ab5a-bf073aa797d5","prodAppKey":"a40c761a-b664-4bc6-ab5a-bf073aa797d5","merchantName":"SYNERGIC_SOFTEK_SOLUTIONS","appMode":"DEMO","currencyCode":"INR","captureSignature":false,"prepareDevice":false}'
    var response = await RNEzetapSdk.initialize(withAppKey)
    console.log(response)
    var jsonData = JSON.parse(response)

    if (jsonData.status == "success") {
      await handleRazorpayClient()
        .then(async res => {
          console.log("###################", res)
          var res = await RNEzetapSdk.close()
          console.log("CLOSEEEEE TNXXXXX", res)
          // var json = JSON.parse(res)
        })
        .catch(err => {
          console.log("==================", err)
        })
    } else {
      console.log("XXXXXXXXXXXXXXXXXXX", res)
    }
  }

  return (
    <View>
      <CustomHeader />
      <ScrollView
        style={{
          backgroundColor: COLORS.lightScheme.background,
          height: "90%",
          padding: 10,
        }}>
        {/* <ScrollView> */}
        <Text style={styles.info}>Preview</Text>
        {/* Table Component */}
        <View style={styles.tableConatiner}>
          <Table
            borderStyle={{
              borderWidth: 5,
              borderColor: COLORS.lightScheme.primary,
            }}
            style={{ backgroundColor: COLORS.lightScheme.onTertiary }}>
            <Rows data={tableData} textStyle={styles.text} />
          </Table>
        </View>

        {/* <View style={styles.netTotalTableContainer}>
            <Table
              borderStyle={{ borderWidth: 0, borderColor: COLORS.lightScheme.primary,  }}
              style={{ backgroundColor: COLORS.lightScheme.onTertiary }}>
              <Rows data={netTotalSectionTableData} textStyle={styles.netTotalText} />
            </Table>
          </View> */}

        <View
          style={{
            // alignSelf: "center",
            marginVertical: 15,
          }}>
          <RadioGroup
            radioButtons={radioButtons}
            onPress={setSelectedId}
            selectedId={selectedId}
            layout="row"
            labelStyle={{
              fontWeight: "800",
              fontSize: 20,
            }}
          />
        </View>

        {selectedId === "1" ? (
          <View style={styles.inputContainer}>
            <View style={styles.netTotalTableContainer}>
              <Table
                borderStyle={{
                  borderWidth: 1,
                  borderColor: COLORS.lightScheme.primary,
                }}
                style={{
                  backgroundColor: COLORS.lightScheme.secondaryContainer,
                }}>
                <Rows
                  data={netTotalSectionTableData}
                  textStyle={styles.netTotalText}
                />
              </Table>
            </View>
            <View style={styles.buttonContainer}>
              <CancelButtonComponent
                title={"Back"}
                customStyle={{
                  marginTop: 10,
                  backgroundColor: "white",
                  colors: "red",
                  width: "40%",
                }}
                handleOnpress={() => {
                  navigation.goBack()
                }}
              />
              <ButtonComponent
                disabled={isLoading}
                title={
                  !isLoading ? (
                    "Save"
                  ) : (
                    <ActivityIndicator color={COLORS.lightScheme.primary} />
                  )
                }
                customStyle={{ marginTop: 10, width: "40%" }}
                handleOnpress={() => {
                  handleSave()
                }}
                // disabled={isSaveEnabled}
              />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={{
              marginVertical: 20,
              border: 5,
              borderColor: "black",
            }}
            // onPress={handleRazorpayClient}
            onPress={init}>
            {/* <ButtonComponent
              title={"Proceed to Razorpay"}
              customStyle={{ width: "90%" }}
              handleOnpress={handleRazorpayClient}
            /> */}

            <Image
              source={razor}
              style={styles.image}
              resizeMode="cover"
              // onError={err => setIsImageLoad(false)}
            />
          </TouchableOpacity>
        )}
        {/* </ScrollView> */}
      </ScrollView>
    </View>
  )
}

export default AccountPreview

const styles = StyleSheet.create({
  text: {
    margin: 6,
    color: COLORS.lightScheme.onBackground,
    fontWeight: "400",
    fontSize: 18,
  },
  netTotalTableContainer: {
    padding: 10,
    // backgroundColor: COLORS.lightScheme.primary,
    borderRadius: 15,
  },
  netTotalText: {
    margin: 6,
    color: "teal",
    // fontWeight: 'bold',
    fontSize: 18,
  },
  inputContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: COLORS.lightScheme.secondaryContainer,
    borderRadius: 5,
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
  buttonContainer: {
    marginVertical: 10,
    // padding: 10,
    paddingTop: -5,
    backgroundColor: COLORS.darkScheme.onSecondaryContainer,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tableConatiner: {
    padding: 10,
    backgroundColor: COLORS.lightScheme.onTertiary,
    borderRadius: 5,
  },
  image: {
    height: 80,
    width: "80%",
    alignSelf: "center",
  },
})
