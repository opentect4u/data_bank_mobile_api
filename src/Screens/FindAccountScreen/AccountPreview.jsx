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
import OverlayLoader from "../../Components/OverlayLoader"
import ThermalPrinterModule from "react-native-thermal-printer"
import { ezetapStorage } from "../../storage/appStorage"

const AccountPreview = ({ navigation, route }) => {
  const [isLoading, setLoading] = useState(false)
  const [isLoadingOverlay, setLoadingOverlay] = useState(false)
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
    // razorpayInitializationJson,
    bankId,
    branchCode,
  } = useContext(AppStore)

  const { item, money } = route.params
  const [lastTnxDate, setLastTnxDate] = useState(() => "")

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
      lastTnxDate
        ? new Date(lastTnxDate).toLocaleDateString("en-GB")
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
  // const [tnxResponse, setTnxResponse] = useState()
  var tnxResponse

  const resetAction = StackActions.popToTop()

  const getLastTnxDate = async () => {
    const obj = {
      bank_id: bankId,
      branch_code: branchCode,
      agent_code: userId,
      account_number: item?.account_number,
      flag: "D",
    }

    console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOO", obj)

    await axios
      .post(address.LAST_TNX_DATE, obj, {
        headers: {
          Accept: "application/json",
        },
      })
      .then(res => {
        setLastTnxDate(
          res?.data?.success?.length !== 0
            ? res?.data?.success?.msg[0]?.last_trns_dt?.toString()
            : "",
        )

        // {"status": true, "success": []}
        console.log(
          ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
          res?.data?.success?.msg[0]?.last_trns_dt,
        )
      })
      .catch(err => {
        console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<", err)
      })
  }

  useEffect(() => {
    getLastTnxDate()
  }, [])

  const sendCollectedMoney = async () => {
    setLoading(true)
    setLoadingOverlay(true)
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
    setLoadingOverlay(false)
  }

  async function printReceipt(rcptNo) {
    try {
      let payload = `[C]<font size='normal'>${bankName}</font>\n`
      payload += `[C]<font size='normal'>${branchName}</font>\n`
      payload += `[C]<font size='normal'>RECEIPT</font>\n`
      // payload += `[C]<font size='big'><B>--------------</font>\n`

      payload +=
        `[C]<font size='big'>--------------</font>\n` +
        `[L]<b>AGENT NAME : [R]${agentName.toString()}\n` +
        `[L]<b>RCPT DATE  : [R]${(
          new Date(todayDT).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }) +
          "," +
          new Date(todayDT).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        ).toString()}\n` +
        `[L]<b>RCPT NO    : [R]${rcptNo
          .toString()
          .substring(rcptNo.toString().length - 6)}\n` +
        `[L]<b>A/C NO     : [R]${(item?.account_number).toString()}\n` +
        `[L]<b>NAME       : [R]${item?.customer_name.toString()}\n` +
        `[L]<b>OPEN BAL   : [R]${(item?.current_balance).toString()}\n` +
        `[L]<b>COLL AMT   : [R]${money.toString()}\n` +
        `[L]<b>CLOSE BAL  : [R]${parseFloat(
          item?.current_balance + parseFloat(money),
        ).toString()}\n` +
        `[L]<b>PRV TNX DT : [R]${new Date(lastTnxDate).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          },
        )}\n` +
        `[L]<b>A/C OPN DT : [R]${new Date(item?.opening_date)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
          .toString()}\n`

      payload += `[C]<font size='big'>--------------</font>\n\n\n\n`

      await ThermalPrinterModule.printBluetooth({
        payload: payload,
        printerNbrCharactersPerLine: 32,
        printerDpi: 120,
        printerWidthMM: 58,
        mmFeedPaper: 25,
      })
    } catch (e) {
      console.log(e.message || "ERROR")
    }
  }

  // async function printReceipt(rcptNo) {
  //   try {
  //     await BluetoothEscposPrinter.printerAlign(
  //       BluetoothEscposPrinter.ALIGN.CENTER,
  //     )
  //     await BluetoothEscposPrinter.printText(bankName, { align: "center" })
  //     await BluetoothEscposPrinter.printText("\r\n", {})
  //     await BluetoothEscposPrinter.printText(branchName, { align: "center" })
  //     await BluetoothEscposPrinter.printText("\r\n", {})

  //     await BluetoothEscposPrinter.printText("RECEIPT", {
  //       align: "center",
  //     })

  //     await BluetoothEscposPrinter.printText("\r", {})

  //     // await BluetoothEscposPrinter.printPic(logo, { width: 300, align: "center", left: 30 })

  //     await BluetoothEscposPrinter.printText(
  //       "-------------------------------",
  //       {},
  //     )
  //     await BluetoothEscposPrinter.printText("\r\n", {})

  //     let columnWidths = [11, 1, 18]

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["AGENT NAME", ":", agentName.toString()],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       [
  //         "RCPT DATE",
  //         ":",
  //         (
  //           new Date(todayDT).toLocaleDateString("en-GB", {
  //             day: "2-digit",
  //             month: "2-digit",
  //             year: "2-digit",
  //           }) +
  //           ", " +
  //           new Date(todayDT).toLocaleTimeString("en-GB", {
  //             hour: "2-digit",
  //             minute: "2-digit",
  //           })
  //         ).toString(),
  //       ],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["RCPT NO", ":", rcptNo.toString().substring(0, 6)],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["ACC NO", ":", (item?.account_number).toString()],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["NAME", ":", item?.customer_name.toString()],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["OPEN BAL", ":", (item?.current_balance).toString()],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["COLL AMT", ":", money.toString()],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       [
  //         "CLOSE BAL",
  //         ":",
  //         parseFloat(item?.current_balance + parseFloat(money)).toString(),
  //       ],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       [
  //         "PRV TNX DT",
  //         ":",
  //         item?.last_trns_dt
  //           ? new Date(item?.last_trns_dt)
  //               .toLocaleDateString("en-GB", {
  //                 day: "2-digit",
  //                 month: "2-digit",
  //                 year: "2-digit",
  //               })
  //               .toString()
  //           : "No date.",
  //       ],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       [
  //         "ACC OPN DT",
  //         ":",
  //         new Date(item?.opening_date)
  //           .toLocaleDateString("en-GB", {
  //             day: "2-digit",
  //             month: "2-digit",
  //             year: "2-digit",
  //           })
  //           .toString(),
  //       ],
  //       {},
  //     )

  //     // await BluetoothEscposPrinter.printText("\r\n", {})

  //     // await BluetoothEscposPrinter.printText("\r\n", {})
  //     await BluetoothEscposPrinter.printText(
  //       "---------------X---------------",
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {})
  //   } catch (e) {
  //     console.log(e.message || "ERROR")
  //     // ToastAndroid.showWithGravityAndOffset(
  //     //   "Printer not connected.",
  //     //   ToastAndroid.SHORT,
  //     //   ToastAndroid.CENTER,
  //     //   25,
  //     //   50,
  //     // )
  //   }
  // }

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
      customerMobileNumber: "",
      externalRefNumber: "",
      externalRefNumber2: "",
      externalRefNumber3: "",
      accountLabel: "AC1",
      customerEmail: "",
      pushTo: { deviceId: "1492621778|razorpay_pos_soundbox" },
      mode: "ALL",
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

    // var res = await RNEzetapSdk.prepareDevice()
    // console.log("RAZORPAY===PREPARE DEVICE", res)

    await RNEzetapSdk.pay(jsonString)
      .then(res => {
        console.log(">>>>>>>>>>>>>>>>>", res)

        // if (res?.status == "success") {
        //   handleSave()
        //   Alert.alert("Txn ID", res?.txnId)
        // } else {
        //   Alert.alert("Error in Tnx", res?.error)
        // }
        tnxResponse = res
        // setTnxResponse(res)
      })
      .catch(err => {
        console.log("<<<<<<<<<<<<<<<<<", err)
      })
  }

  const init = async () => {
    // var withAppKey =
    //   '{"userName":' +
    //   "9903044748" +
    //   ',"demoAppKey":"a40c761a-b664-4bc6-ab5a-bf073aa797d5","prodAppKey":"a40c761a-b664-4bc6-ab5a-bf073aa797d5","merchantName":"SYNERGIC_SOFTEK_SOLUTIONS","appMode":"DEMO","currencyCode":"INR","captureSignature":false,"prepareDevice":false}'
    // var response = await RNEzetapSdk.initialize(withAppKey)
    // console.log(response)
    // var jsonData = JSON.parse(response)

    let razorpayInitializationJson = JSON.parse(
      ezetapStorage.getString("ezetap-initialization-json"),
    )

    if (razorpayInitializationJson.status == "success") {
      await handleRazorpayClient()
        .then(async res => {
          console.log("###################", res)
          // var res = await RNEzetapSdk.close()
          // console.log("CLOSEEEEE TNXXXXX", res)
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
      {isLoadingOverlay !== true ? (
        <ScrollView
          style={{
            backgroundColor: COLORS.lightScheme.background,
            height: "90%",
            padding: 10,
          }}>
          <Text style={styles.info}>Preview</Text>

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
            <View
              style={{
                flexDirection: "row",
                // padding: 10,
                marginBottom: 20,
                // borderWidth: 2,
                // borderColor: COLORS.lightScheme.primary,
                justifyContent: "space-evenly",
                alignItems: "center",
              }}>
              <TouchableOpacity
                onPress={async () =>
                  await init()
                    .then(() => {
                      console.log(
                        "TRANSACTION RES DATA================",
                        tnxResponse,
                      )
                      if (JSON.parse(tnxResponse)?.status === "success") {
                        handleSave()
                        // Alert.alert(
                        //   `Transaction ID`,
                        //   `${tnxResponse?.result?.txn?.txnId}`,
                        // )
                      } else {
                        console.log("tnxResponse value error...")
                      }
                    })
                    .catch(err => {
                      console.error("TNX Response Error!")
                    })
                }
                style={{
                  // marginVertical: 20,
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: "black",
                  padding: 10,
                  borderRadius: 50,
                }}>
                <Image
                  source={razor}
                  style={styles.image}
                  resizeMode="cover"
                  // onError={err => setIsImageLoad(false)}
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        <OverlayLoader />
      )}
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
    // marginTop: -20,
    height: 30,
    width: 150,
    alignSelf: "center",
  },
})
