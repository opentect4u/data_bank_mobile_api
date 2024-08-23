import { useContext, useState, useEffect } from "react"
import {
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  Modal,
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
import { removeIndexes } from "../../Functions/removeIndexes"

const MiniStatementInner = ({ route }) => {
  const { item } = route.params
  // console.log('item '+item.acc_type)
  const { userId, bankId, branchCode, bankName, branchName, agentName } =
    useContext(AppStore)

  const [selectedStartDate, setSelectedStartDate] = useState(() => new Date())
  const [selectedEndDate, setSelectedEndDate] = useState(() => new Date())
  const [showModal, setShowModal] = useState(() => false)
  const [miniStatementArray, setMiniStatementArray] = useState(() => [])
  const [totalAmount, setTotalAmount] = useState(() => 0)
  const [isLoading, setIsLoading] = useState(false)
  const startDate = selectedStartDate
    ? selectedStartDate.toISOString().slice(0, 10)
    : ""
  const endDate = selectedEndDate
    ? selectedEndDate.toISOString().slice(0, 10)
    : ""

  const onDateChange = (date, type) => {
    if (type === "END_DATE") {
      setSelectedEndDate(date)
      setShowModal(false)
    } else {
      setSelectedStartDate(date)
      setSelectedEndDate(null)
    }
  }

  const tableHead = ["Sl No.", "Date", "Deposit", "Balance"]
  const accountDetailsTable = [[item?.customer_name], [item?.account_number]]
  let tableData = miniStatementArray

  const dateFormatters = dateData => {
    const originalDate = dateData
    const date = new Date(originalDate)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    const formattedDate = `${day}/${month}/${year}`
    console.log(formattedDate)
    return formattedDate
  }

  const getMiniStatement = async () => {
    setIsLoading(true)
    const obj = {
      bank_id: bankId,
      branch_code: branchCode,
      agent_code: userId,
      account_number: item?.account_number,
      account_type: item?.acc_type,
      // from_date: startDate,
      // to_date: endDate,
    }
    let totalDepositedAmount = 0
    await axios
      .post(address.MINI_STATEMENT, obj, {
        headers: {
          Accept: "application/json",
        },
      })
      .then(res => {
        setIsLoading(false)
        console.log(res.data.success.msg)
        res.data.success.msg.forEach((item, i) => {
          let rowArr = [
            i + 1,
            new Date(item.PAID_DT).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }),
            //dateFormatters(item.PAID_DT),
            item.PAID_AMT,
            item.BALANCE_AMT,
          ]
          totalDepositedAmount += item.PAID_AMT
          console.log("ITEMMM TABLEEE=====", rowArr)
          tableData.push(...[rowArr])
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
        setTotalAmount(totalDepositedAmount)
        console.log("++++++ TABLE DATA ++++++++", tableData)
        setMiniStatementArray(tableData)
      })
      .catch(err => {
        setIsLoading(false)

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

  // async function printReceipt() {
  //   try {
  //     await BluetoothEscposPrinter.printerAlign(
  //       BluetoothEscposPrinter.ALIGN.CENTER,
  //     )
  //     await BluetoothEscposPrinter.printText(bankName, { align: "center" })
  //     await BluetoothEscposPrinter.printText("\r\n", {})
  //     await BluetoothEscposPrinter.printText(branchName, { align: "center" })
  //     await BluetoothEscposPrinter.printText("\r\n", {})
  //     await BluetoothEscposPrinter.printColumn(
  //       [10, 2, 18],
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       [
  //         "Date",
  //         ":",
  //         new Date()
  //           .toLocaleDateString("en-GB", {
  //             day: "2-digit",
  //             month: "2-digit",
  //             year: "2-digit",
  //           })
  //           .toString(),
  //       ],
  //       {},
  //     )
  //     await BluetoothEscposPrinter.printColumn(
  //       [10, 2, 18],
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["Agent", ":", agentName],
  //       {},
  //     )
  //     await BluetoothEscposPrinter.printColumn(
  //       [10, 2, 18],
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["Cus Name", ":", item.customer_name],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printColumn(
  //       [10, 2, 18],
  //       [
  //         BluetoothEscposPrinter.ALIGN.LEFT,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.RIGHT,
  //       ],
  //       ["Acc No", ":", item.account_number],
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printText(
  //       "-------------------------------\n",
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printText("MINI STATEMENT\n", {
  //       align: "center",
  //     })

  //     // await BluetoothEscposPrinter.printText(`FROM: ${new Date(startDate).toLocaleDateString("en-GB", {day: "2-digit", month: "2-digit", year: "2-digit"})}  TO: ${new Date(endDate).toLocaleDateString("en-GB", {day: "2-digit", month: "2-digit", year: "2-digit"})}`, {
  //     //   align: "center",
  //     // })

  //     await BluetoothEscposPrinter.printText("\r", {})

  //     // await BluetoothEscposPrinter.printPic(logo, { width: 300, align: "center", left: 30 })

  //     await BluetoothEscposPrinter.printText(
  //       "-------------------------------",
  //       {},
  //     )
  //     await BluetoothEscposPrinter.printText("\r\n", {})

  //     let columnWidthsHeader = [10, 10, 10]
  //     await BluetoothEscposPrinter.printColumn(
  //       columnWidthsHeader,
  //       [
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //         BluetoothEscposPrinter.ALIGN.CENTER,
  //       ],
  //       ["Date", "Coll Amt", "Cls Bal"],
  //       {},
  //     )

  //     const copiedTableData = [...tableData]
  //     console.log("TABLLLELEEEEE DDDAAATAAAA  CPPPYYY ", copiedTableData)

  //     let columnWidthsBody = [30]
  //     copiedTableData.forEach(async item => {
  //       let newItems = [...item]
  //       console.log("new itemsssssss", newItems)
  //       const updatedItems = removeIndexes(newItems, [0])

  //       // updatedItems[2] = updatedItems[2].slice(0, 8)
  //       let items = updatedItems.join("     ")
  //       console.log("++==++ PRINTED ITEM", items)
  //       await BluetoothEscposPrinter.printColumn(
  //         columnWidthsBody,
  //         [BluetoothEscposPrinter.ALIGN.CENTER],
  //         [items.toString()],
  //         {},
  //       )
  //     })

  //     await BluetoothEscposPrinter.printText(
  //       "-------------------------------\n",
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printText(
  //       `TOTAL AMOUNT: ${totalAmount}\r\n`,
  //       {
  //         align: "center",
  //       },
  //     )
  //     // await BluetoothEscposPrinter.printText("Total Receipts: " + totalReceipts + "\n", { align: "center" })
  //     // await BluetoothEscposPrinter.printText("Total Amount: " + total + "\n", { align: "center" })
  //     await BluetoothEscposPrinter.printText(
  //       "---------------X---------------",
  //       {},
  //     )

  //     await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {})
  //   } catch (e) {
  //     console.log(e.message || "ERROR")
  //     ToastAndroid.showWithGravityAndOffset(
  //       "Printer not connected.",
  //       ToastAndroid.SHORT,
  //       ToastAndroid.CENTER,
  //       25,
  //       50,
  //     )
  //   }
  // }

  async function printReceipt() {
    try {
      let payload = `[C]<font size='normal'>${bankName}</font>\n`
      payload += `[C]<font size='normal'>${branchName}</font>\n`
      // payload += `[C]<font size='normal'>RECEIPT</font>\n`
      // payload += `[C]<font size='big'><B>--------------</font>\n`
      payload += `[L]<b>DATE     : [R]${new Date()
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
        .toString()}\n`
      payload += `[L]<b>AGENT    : [R]${agentName.toString()}\n`
      payload += `[L]<b>CUS NAME : [R]${item.customer_name.toString()}\n`
      payload += `[L]<b>A/C NO   : [R]${item.account_number.toString()}\n`

      // payload += `[L]<b>AGENT   : [R]${agentName}\n`
      payload += `[C]<font size='big'><B>--------------</font>\n`
      payload += `[C]<b>MINI STATEMENT\n`
      payload += `[L]FROM: ${new Date(startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })} [R]TO: ${new Date(endDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })}\n`
      payload += `[C]<font size='big'><B>--------------</font>\n`
      payload += `[L]DATE [C]COLL AMT [R]CLS BAL\n`

      const copiedTableData = [...tableData]
      console.log("TABLLLELEEEEE DDDAAATAAAA  CPPPYYY ", copiedTableData)

      copiedTableData.forEach(async item => {
        let newItems = [...item]
        console.log("new itemsssssss", newItems)
        const updatedItems = removeIndexes(newItems, [0])

        // updatedItems[2] = updatedItems[2].slice(0, 8)
        let items = updatedItems.join("       ")
        console.log("++==++ PRINTED ITEM", items)
        payload += `[L]${items.toString()}\n`
      })

      payload += `[C]<font size='big'><B>--------------</font>\n`
      payload += `[C]TOTAL AMT : ${totalAmount}\n`
      payload += `[C]<font size='big'><B>--------------</font>\n\n\n`

      await ThermalPrinterModule.printBluetooth({
        payload: payload,
        printerNbrCharactersPerLine: 32,
        printerDpi: 120,
        printerWidthMM: 58,
        mmFeedPaper: 25,
      })
      copiedTableData = []
    } catch (e) {
      console.log(e.message || "ERROR")
    }
  }

  useEffect(() => {
    getMiniStatement()
  }, [])

  // const handleSubmit = () => {
  //   tableData = []
  //   getMiniStatement()
  // }

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
        <Text style={styles.todayCollection}>Mini Statement</Text>
        {/* <View style={styles.dateWrapper}> */}
        {/* <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{
              justifyContent: "space-around",
              flexDirection: "row",
              backgroundColor: "forestgreen",
              padding: 10,
              margin: 10,
              borderRadius: 10,
              height: 40,
              width: "100%",
            }}>
            {/* <Text>Show Calendar</Text> */}
        {/* <Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: COLORS.lightScheme.onPrimary,
                fontWeight: "bold",
              }}>
              From: {new Date(startDate).toLocaleDateString("en-GB")}
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: COLORS.lightScheme.onPrimary,
                fontWeight: "bold",
              }}>
              To: {new Date(endDate).toLocaleDateString("en-GB")}
            </Text>
          </TouchableOpacity> */}
        {/* <Modal visible={showModal} animationType="fade">
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.lightScheme.onPrimary,
                margin: 20,
              }}>
              <CalendarPicker
                startFromMonday={true}
                allowRangeSelection={true}
                todayBackgroundColor="tomato"
                selectedDayColor="dodgerblue"
                selectedDayTextColor="#FFFFFF"
                onDateChange={onDateChange}
              />
            </View>
          </Modal> */}
        {/* </View> */}
        <View>
          <Table
            borderStyle={{
              borderWidth: 2,
              borderColor: COLORS.lightScheme.secondary,
              borderRadius: 10,
            }}
            style={{ backgroundColor: COLORS.lightScheme.background }}>
            <Row
              data={accountDetailsTable}
              textStyle={styles.accountDetailsStyle}
            />
          </Table>
        </View>
        {/* <View>
          <TouchableOpacity
            onPress={() => handleSubmit()}
            style={styles.dateButton}>
            <Text>SUBMIT</Text>
          </TouchableOpacity>
        </View> */}
        {isLoading && (
          <ActivityIndicator
            color={COLORS.lightScheme.primary}
            size={"large"}></ActivityIndicator>
        )}
        <ScrollView style={styles.scrollViewStyle}>
          {tableData.length != 0 && (
            <Table
              borderStyle={{
                borderWidth: 2,
                borderColor: COLORS.lightScheme.secondary,
                borderRadius: 10,
              }}
              style={{ backgroundColor: COLORS.lightScheme.background }}>
              {/* <Col data={accountDetailsTable} textStyle={styles.accountDetailsStyle} /> */}
              <Row data={tableHead} textStyle={styles.head} />
              <Rows data={tableData} textStyle={styles.text} />
            </Table>
          )}
        </ScrollView>
        <Text style={{ fontWeight: "bold" }}>Total Amount: {totalAmount}</Text>
        <TouchableOpacity
          disabled={tableData.length == 0}
          onPress={() => printReceipt()}
          style={
            tableData.length != 0 ? styles.dateButton : styles.disabledContainer
          }>
          <Text style={styles.btnLabel}>PRINT</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default MiniStatementInner

const styles = StyleSheet.create({
  dateWrapper: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
    margin: 0,
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

  scrollViewStyle: {
    marginTop: 15,
  },
  disabledContainer: {
    width: "40%",
    height: 40,
    borderWidth: 2,
    borderColor: "lightgray",
    backgroundColor: "lightgray",
    margin: 15,
    borderRadius: 30,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  btnLabel: {
    color: "white",
  },
})
