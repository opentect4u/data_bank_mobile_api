import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
} from "react-native"
import { useContext, useEffect, useState } from "react"
import { COLORS, colors } from "../../Resources/colors"
import CustomHeader from "../../Components/CustomHeader"
import { Table, Rows } from "react-native-table-component"
// import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer"
import ButtonComponent from "../../Components/ButtonComponent"
import axios from "axios"
import { AppStore } from "../../Context/AppContext"
import { StackActions } from "@react-navigation/native"
import { address } from "../../Routes/addresses"
import { Alert } from "react-native"
import CancelButtonComponent from "../../Components/CancelButtonComponent"
// import logoCut from "../../Resources/Images/logo_cut.png"
// import razor from "../../Resources/Images/razorpay.webp"
// import ThermalPrinterModule from "react-native-thermal-printer"
// import { ezetapStorage } from "../../storage/appStorage"
// import RNEzetapSdk from "react-native-ezetap-sdk"
import useGlobalPrintPaxA910 from "../../PrintingAgents/useGlobalPrintPaxA910"
import { printReceiptEscPos } from "../../PrintingAgents/globalPrintsEscPos"
import { printingSDKType } from "../../PrintingAgents/config"

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
    bankId,
    branchCode,
  } = useContext(AppStore)

  const { item, money } = route.params

  const [lastTnxDate, setLastTnxDate] = useState(() => "")
  const { printReceiptPaxA910 } = useGlobalPrintPaxA910()

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
    [
      "Current Balance",
      item?.acc_type == "L"
        ? item?.current_balance - parseFloat(money)
        : item?.current_balance + parseFloat(money),
    ],
  ]

  const resetAction = StackActions.popToTop()

  var tnxResponse

  const getLastTnxDate = async () => {
    const obj = {
      bank_id: bankId,
      branch_code: branchCode,
      agent_code: userId,
      account_number: item?.account_number,
      flag: item?.acc_type,
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

  const sendCollectedMoney = async txnRes => {
    setLoading(true)
    todayDT = new Date().toISOString()
    // const obj = {
    //   bank_id: item?.bank_id,
    //   branch_code: item?.branch_code,
    //   agent_code: userId,
    //   account_holder_name: item?.customer_name,
    //   transaction_date: todayDT,
    //   account_type: item?.acc_type,
    //   product_code: item?.product_code,
    //   account_number: item?.account_number,
    //   total_amount: item?.current_balance + parseFloat(money),
    //   deposit_amount: parseFloat(money),
    //   collection_by: id,
    //   sec_amt_type: secAmtType,
    //   total_collection_amount: totalCollection,
    //   // flag:'D'
    // }

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

      // pay_mode: "O",
      // pay_txn_id: JSON.parse(txnRes)?.result?.txn?.txnId,
      // pay_amount: JSON.parse(txnRes)?.result?.txn?.amount,
      // pay_amount_original: JSON.parse(txnRes)?.result?.txn?.amountOriginal,
      // currency_code: JSON.parse(txnRes)?.result?.txn?.currencyCode,
      // payment_mode: JSON.parse(txnRes)?.result?.txn?.paymentMode,
      // pay_status: JSON.parse(txnRes)?.result?.txn?.status,
      // receipt_url: JSON.parse(txnRes)?.result?.receipt?.receiptUrl,
    }

    console.log("===========", obj)
    await axios
      .post(address.TRANSACTION, obj, {
        headers: {
          Accept: "application/json",
        },
      })
      .then(async res => {
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

          console.log(
            "printingSDKType.paxA910 ===========>>>>>>>>>>>>>>>>",
            printingSDKType.paxA910,
          )

          printingSDKType.paxA910 &&
            (await printReceiptPaxA910(
              res.data.receipt_no,
              item,
              bankName,
              branchName,
              agentName,
              todayDT,
              money,
              lastTnxDate,
            ))
          printingSDKType.escpos &&
            (await printReceiptEscPos(
              res.data.receipt_no,
              item,
              bankName,
              branchName,
              agentName,
              todayDT,
              money,
              lastTnxDate,
            ))

          // navigation.dispatch(resetAction)
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

  console.log("RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR", secAmtType)

  const handleSave = txnRes => {
    getTotalDepositAmount()
    // console.log("##$$$$###$$$", maximumAmount, money, totalDepositedAmount)
    // console.log("##$$$$+++++###$$$", money + totalDepositedAmount)
    // console.log("##$$$$+++++###$$$", typeof money, typeof totalDepositedAmount)
    // console.log("##$$$$+++++###$$$", parseFloat(money) + totalDepositedAmount)
    console.log("SEC AMT TYPE===============>>>>>>>>>>>>>", secAmtType)

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

      // if (maximumAmount >= parseFloat(money) + totalDepositedAmount) {
      if (maximumAmount >= parseFloat(money) + totalCollection) {
        console.log("MMMMMMMMMMMMMMMM")
        setIsSaveEnabled(true)
        // sendCollectedMoney()
        sendCollectedMoney(txnRes)
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

  const handleSaveForLoan = () => {
    getTotalDepositAmount()
    console.log("##$$$$###$$$", maximumAmount, money, totalDepositedAmount)
    console.log("##$$$$+++++###$$$", money + totalDepositedAmount)
    console.log("##$$$$+++++###$$$", typeof money, typeof totalDepositedAmount)
    console.log("##$$$$+++++###$$$", parseFloat(money) + totalDepositedAmount)
    if (!(maximumAmount < parseFloat(money) + totalDepositedAmount)) {
      setIsSaveEnabled(true)
      sendCollectedMoney()
    } else {
      ToastAndroid.showWithGravityAndOffset(
        "Your collection quota has been exceeded.",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
        25,
        50,
      )
    }
  }

  // const handleRazorpayClient = async () => {
  //   let json = {
  //     username: "9903044748",
  //     amount: +money,
  //     externalRefNumber: "",
  //   }

  //   // Convert json object to string
  //   let jsonString = JSON.stringify(json)

  //   // await RNEzetapSdk.initialize(jsonString)
  //   //   .then(res => {
  //   //     console.log(">>>>>>>>>>>>>>>>>", res)
  //   //   })
  //   //   .catch(err => {
  //   //     console.log("<<<<<<<<<<<<<<<<<", err)
  //   //   })

  //   // var res = await RNEzetapSdk.prepareDevice()
  //   // console.log("RAZORPAY===PREPARE DEVICE", res)

  //   await RNEzetapSdk.pay(jsonString)
  //     .then(res => {
  //       console.log(">>>>>>>>>>>>>>>>>", res)

  //       // if (res?.status == "success") {
  //       //   handleSave()
  //       //   Alert.alert("Txn ID", res?.txnId)
  //       // } else {
  //       //   Alert.alert("Error in Tnx", res?.error)
  //       // }
  //       tnxResponse = res
  //       // setTnxResponse(res)
  //     })
  //     .catch(err => {
  //       console.log("<<<<<<<<<<<<<<<<<", err)
  //     })
  // }

  // const init = async () => {
  //   // var withAppKey =
  //   //   '{"userName":' +
  //   //   "9903044748" +
  //   //   ',"demoAppKey":"a40c761a-b664-4bc6-ab5a-bf073aa797d5","prodAppKey":"a40c761a-b664-4bc6-ab5a-bf073aa797d5","merchantName":"SYNERGIC_SOFTEK_SOLUTIONS","appMode":"DEMO","currencyCode":"INR","captureSignature":false,"prepareDevice":false}'
  //   // var response = await RNEzetapSdk.initialize(withAppKey)
  //   // console.log(response)
  //   // var jsonData = JSON.parse(response)

  //   let razorpayInitializationJson = JSON.parse(
  //     ezetapStorage.getString("ezetap-initialization-json"),
  //   )

  //   if (razorpayInitializationJson.status == "success") {
  //     await handleRazorpayClient()
  //       .then(async res => {
  //         console.log("###################", res)
  //         // var res = await RNEzetapSdk.close()
  //         // console.log("CLOSEEEEE TNXXXXX", res)
  //         // var json = JSON.parse(res)
  //       })
  //       .catch(err => {
  //         console.log("==================", err)
  //       })
  //   } else {
  //     console.log("XXXXXXXXXXXXXXXXXXX", res)
  //   }
  // }

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
            {/* <ButtonComponent
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
            /> */}
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
                item?.acc_type != "L" ? handleSave() : handleSaveForLoan()
              }}
            />
            {/* <TouchableOpacity
                onPress={async () =>
                  await init()
                    .then(() => {
                      console.log(
                        "TRANSACTION RES DATA================",
                        tnxResponse,
                      )
                      if (JSON.parse(tnxResponse)?.status === "success") {
                        item?.acc_type != "L"
                          ? handleSave(tnxResponse)
                          : handleSaveForLoan()
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
                {!isLoading ? (
                  <Image
                    source={razor}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <ActivityIndicator color={COLORS.lightScheme.primary} />
                )}
              </TouchableOpacity> */}
          </View>
        </View>

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
