import { useContext, useEffect, useState } from "react"
import {
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native"
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer"
import ThermalPrinterModule from "react-native-thermal-printer"
import { AppStore } from "../../Context/AppContext"
import CustomHeader from "../../Components/CustomHeader"
import { COLORS } from "../../Resources/colors"
import { Table, Rows, Row, Col } from "react-native-table-component"
import axios from "axios"
import CalendarPicker from "react-native-calendar-picker"
import { address } from "../../Routes/addresses"
import { icon } from "../../Resources/Icons"

const DuplicateReceiptInner = ({ route }) => {
  const { item } = route.params

  const {
    userId,
    bankId,
    branchCode,
    bankName,
    branchName,
    agentName,
    todayDateFromServer,
  } = useContext(AppStore)

  const [duplicateReceipts, setDuplicateReceipts] = useState(() => [])

  const [loading, setLoading] = useState(() => true)

  const tableHead = ["Date", "Rcpt No", "Dep Amt", "Print"]
  let tableData = duplicateReceipts

  const getDuplicateReceipts = async () => {
    const obj = {
      bank_id: bankId,
      branch_code: branchCode,
      agent_code: userId,
      account_number: item?.account_number,
      account_type: item?.acc_type,
    }
    console.log("obj" + obj)
    await axios
      .post(address.DUPLICATE_RECEIPT, obj, {
        headers: {
          Accept: "application/json",
        },
      })
      .then(res => {
        res?.data?.success?.msg?.forEach((item, i) => {
          let rowArr = [
            new Date(item?.collected_at)?.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }),
            item?.receipt_no,
            item?.deposit_amount,
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Print Duplicate",
                  "Are you sure you want to Print?",
                  [
                    {
                      text: "No",
                      onPress: () => console.log("Cancel Pressed"),
                    },
                    {
                      text: "Print",
                      onPress: async () => {
                        await getLastTnxDate(item?.receipt_no)
                        printReceipt(
                          // item.receipt_no,
                          // item.date,
                          // item.account_holder_name,
                          // item.account_number,
                          // item.account_type,
                          // item.deposit_amount,
                          item,
                        ).then(() => {
                          prevTnxDate = ""
                        })
                      },
                    },
                  ],
                )
              }}
              style={styles.dateButton}>
              {icon.printer(COLORS.lightScheme.primary, 30)}
            </TouchableOpacity>,
          ]
          console.log("ITEMMM TABLEEE=====", rowArr)
          tableData.push(...[rowArr])

          setLoading(false)
        })
        if (tableData.length == 0) {
          ToastAndroid.showWithGravityAndOffset(
            "No data found!",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
            25,
            50,
          )
        }
        console.log("++++++ TABLE DATA ++++++++", tableData)
        setDuplicateReceipts(tableData)
      })
      .catch(err => {
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

  let prevTnxDate = ""

  const getLastTnxDate = async rcptNo => {
    const obj = {
      bank_id: bankId,
      branch_code: branchCode,
      agent_code: userId,
      account_number: item?.account_number,
      receipt_no: rcptNo,
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
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", res?.data)
        console.log(
          ">>>>>>>>>>>>>jhgff>>>>>>>>>>>>>>>>>>",
          res?.data?.success?.msg[0]?.last_trns_dt,
        )

        // setLastTnxDate(
        //   res?.data?.success?.length !== 0
        //     ? res?.data?.success?.msg[0]?.last_trns_dt?.toString()
        //     : "",
        // )

        prevTnxDate = res?.data?.success?.msg[0]?.last_trns_dt

        // {"status": true, "success": []}
        // console.log(
        //   ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
        //   res?.data?.success?.msg[0]?.last_trns_dt,
        // )
      })
      .catch(err => {
        console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<", err)
      })
  }

  // async function printReceipt(item) {
  //   console.log(item)
  //   try {
  //     await BluetoothEscposPrinter.printerAlign(
  //       BluetoothEscposPrinter.ALIGN.CENTER,
  //     )
  //     await BluetoothEscposPrinter.printText(bankName, { align: "center" })
  //     await BluetoothEscposPrinter.printText("\r\n", {})
  //     await BluetoothEscposPrinter.printText(branchName, { align: "center" })
  //     await BluetoothEscposPrinter.printText("\r\n", {})

  //     await BluetoothEscposPrinter.printText("DUPLICATE RECEIPT", {
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
  //           new Date(todayDateFromServer).toLocaleDateString("en-GB", {
  //             day: "2-digit",
  //             month: "2-digit",
  //             year: "2-digit",
  //           }) +
  //           ", " +
  //           new Date(todayDateFromServer).toLocaleTimeString("en-GB", {
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
  //       ["RCPT NO", ":", item?.receipt_no.toString().substring(0, 6)],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["ACC NO", ":", item?.account_number],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["NAME", ":", item?.account_holder_name],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["OPEN BAL", ":", item?.opening_bal.toString()],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["COLL AMT", ":", item?.deposit_amount.toString()],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidths,
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["CLOSE BAL", ":", item?.closing_bal.toString()],
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

  //     await BluetoothEscposPrinter.printText(
  //       "---------------X---------------",
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {})
  //   } catch (e) {
  //     console.log(e.message || "ERROR")
  //     // console.log( "ERROR")
  //     // ToastAndroid.showWithGravityAndOffset(
  //     //   "Printer not connected.",
  //     //   ToastAndroid.SHORT,
  //     //   ToastAndroid.CENTER,
  //     //   25,
  //     //   50,
  //     // )
  //   }
  // }

  async function printReceipt(item) {
    try {
      let payload = `[C]<font size='normal'>${bankName}</font>\n`
      payload += `[C]<font size='normal'>${branchName}</font>\n`
      payload += `[C]<font size='normal'>DUPLICATE RECEIPT</font>\n`
      // payload += `[C]<font size='big'><B>--------------</font>\n`

      payload +=
        `[C]<font size='big'>--------------</font>\n` +
        `[L]<b>AGENT NAME : [R]${agentName.toString()}\n` +
        `[L]<b>RCPT DATE  : [R]${(
          new Date(item?.collected_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }) +
          "," +
          new Date(item?.collected_at).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        ).toString()}\n` +
        `[L]<b>RCPT NO    : [R]${item?.receipt_no
          ?.toString()
          ?.substring(item?.receipt_no?.toString()?.length - 6)}\n` +
        `[L]<b>A/C NO     : [R]${item?.account_number?.toString()}\n` +
        `[L]<b>NAME       : [R]${item?.account_holder_name?.toString()}\n` +
        `[L]<b>${
          item?.account_type == "L" ? "PREV BAL" : "OPEN BAL"
        }   : [R]${item?.opening_bal?.toString()}\n` +
        `[L]<b>COLL AMT   : [R]${item?.deposit_amount?.toString()}\n` +
        `[L]<b>${
          item?.account_type == "L" ? "CURR BAL" : "CLOSE BAL"
        }   : [R]${parseFloat(item?.closing_bal?.toString())?.toString()}\n` +
        `[L]<b>PRV TNX DT : [R]${
          prevTnxDate
            ? new Date(prevTnxDate)?.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })
            : "No Date"
        }\n` +
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

  // const handleSubmit = () => {
  //   tableData = []
  //   getDuplicateReceipts()
  // }

  useEffect(() => {
    tableData = []
    getDuplicateReceipts()
  }, [])

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
        <Text style={styles.todayCollection}>Duplicate Receipts</Text>
        <ScrollView>
          {tableData.length != 0 && (
            <Table
              borderStyle={{
                borderWidth: 2,
                borderColor: COLORS.lightScheme.secondary,
                borderRadius: 10,
                // fontSize: 16,
              }}
              style={{ backgroundColor: COLORS.lightScheme.background }}>
              <Row data={tableHead} textStyle={styles.head} />

              {loading ? (
                <ActivityIndicator animating={true} size={"large"} />
              ) : (
                <Rows data={tableData} textStyle={styles.text} />
              )}
            </Table>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

export default DuplicateReceiptInner

const styles = StyleSheet.create({
  dateWrapper: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
    margin: 20,
  },
  dateButton: {
    width: "50%",
    height: 40,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "white",
    margin: 15,
    borderRadius: 10,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    margin: 6,
    color: COLORS.lightScheme.onBackground,
    fontWeight: "400",
    fontSize: 16,
  },
  accountDetailsStyle: {
    margin: 6,
    color: COLORS.lightScheme.primary,
    fontWeight: "bold",
    fontSize: 20,
  },
  head: {
    margin: 6,
    color: COLORS.lightScheme.onBackground,
    fontWeight: "900",
    fontSize: 16,
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
