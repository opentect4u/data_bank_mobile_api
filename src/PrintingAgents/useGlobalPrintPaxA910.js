import { useNavigation, CommonActions } from "@react-navigation/native"
import ThermalPrinterModule from "react-native-thermal-printer"
import { removeIndexes } from "../Functions/removeIndexes"
// import mainNavigationRoutes from "../Routes/NavigationRoutes"

export default function useGlobalPrintPaxA910() {
  const navigation = useNavigation()

  const printReceiptPaxA910 = async (
    rcptNo,
    item,
    bankName,
    branchName,
    agentName,
    todayDT,
    money,
    lastTnxDate,
  ) => {
    try {
      let payload = `[C]${bankName}\n`
      payload += `[C]${branchName}\n`
      payload += `[C]RECEIPT\n`
      payload += `[C]----------------------------\n`
      payload += `[L]AGENT:[R]${agentName?.slice(0, 12)}\n`
      payload += `[L]DATE:[R]${new Date(todayDT).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })},${new Date(todayDT).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}\n`
      payload += `[L]RCPT NO:[R]${rcptNo.toString().slice(-6)}\n`
      payload += `[L]A/C NO:[R]${item?.account_number}\n`
      payload += `[L]NAME:[R]${item?.customer_name?.slice(0, 12)}\n`
      payload += `[L]${item?.acc_type === "L" ? "PREV BAL" : "OPEN BAL"}: [R]${
        item?.current_balance
      }\n`
      payload += `[L]COLL AMT:[R]${money}\n`
      payload += `[L]${item?.acc_type === "L" ? "CURR BAL" : "CLOSE BAL"}: [R]${
        item?.acc_type === "L"
          ? item?.current_balance - parseFloat(money)
          : item?.current_balance + parseFloat(money)
      }\n`
      payload += `[L]PRV TNX DT:[R]${
        lastTnxDate
          ? new Date(lastTnxDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })
          : "No Date"
      }\n`
      payload += `[L]A/C OPN DT:[R]${new Date(
        item?.opening_date,
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })}\n`
      payload += `[C]----------------------------\n`

      // navigation.dispatch(
      //   CommonActions.navigate({
      //     name: mainNavigationRoutes.printScreen,
      //     params: { textData: payload },
      //   }),
      // )
      await ThermalPrinterModule.printBluetooth({
        payload: payload,
        printerNbrCharactersPerLine: 32,
        printerDpi: 120,
        printerWidthMM: 58,
        mmFeedPaper: 25,
      })
    } catch (e) {
      console.log(e.message || e)
    }
  }

  const printDuplicateReceiptPaxA910 = async (
    item,
    bankName,
    branchName,
    agentName,
    prevTnxDate,
  ) => {
    try {
      let payload = `[C]${bankName}\n`
      payload += `[C]${branchName}\n`
      payload += `[C]DUPLICATE RECEIPT\n`
      payload += `[C]----------------------------\n`
      payload += `[L]AGENT:[R]${agentName?.slice(0, 12)}\n`
      payload += `[L]DATE:[R]${new Date(item?.collected_at).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        },
      )},${new Date(item?.collected_at).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}\n`
      payload += `[L]RCPT NO:[R]${item?.receipt_no.toString().slice(-6)}\n`
      payload += `[L]A/C NO:[R]${item?.account_number}\n`
      payload += `[L]NAME:[R]${item?.account_holder_name}\n`
      payload += `[L]${
        item?.account_type === "L" ? "PREV BAL" : "OPEN BAL"
      }   : [R]${item?.opening_bal}\n`
      payload += `[L]COLL AMT:[R]${item?.deposit_amount}\n`
      payload += `[L]${
        item?.account_type === "L" ? "CURR BAL" : "CLOSE BAL"
      }:[R]${item?.closing_bal}\n`
      payload += `[L]PRV TNX DT:[R]${
        prevTnxDate
          ? new Date(prevTnxDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })
          : "No Date"
      }\n`
      payload += `[L]A/C OPN DT: [R]${new Date(
        item?.opening_date,
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })}\n`
      payload += `[C]----------------------------\n`

      // await ThermalPrinterModule.printBluetooth({
      //   payload,
      //   printerNbrCharactersPerLine: 32,
      //   printerDpi: 120,
      //   printerWidthMM: 58,
      //   mmFeedPaper: 25,
      // })
      // navigation.dispatch(
      //   CommonActions.navigate({
      //     name: mainNavigationRoutes.printScreen,
      //     params: { textData: payload },
      //   }),
      // )
      await ThermalPrinterModule.printBluetooth({
        payload: payload,
        printerNbrCharactersPerLine: 32,
        printerDpi: 120,
        printerWidthMM: 58,
        mmFeedPaper: 25,
      })
    } catch (e) {
      console.log(e.message || e)
    }
  }

  const printMiniStatementPaxA910 = async (
    item,
    bankName,
    branchName,
    agentName,
    tableData,
    totalAmount,
  ) => {
    try {
      let payload = `[C]${bankName}\n`
      payload += `[C]${branchName}\n`
      payload += `[L]DATE:[R]${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })}\n`
      payload += `[L]AGENT:[R]${agentName}\n`
      payload += `[L]NAME:[R]${item.customer_name}\n`
      payload += `[L]A/C NO:[R]${item.account_number}\n`
      payload += `[C]----------------------------\n`
      payload += `[C]MINI STATEMENT\n`
      payload += `[C]----------------------------\n`
      payload += `[L]DATE [C]COL AMT [R]CLS BAL\n`

      tableData.forEach(row => {
        const cells = removeIndexes([...row], [0]).join("       ")
        payload += `[L]${cells}\n`
      })

      payload += `[C]----------------------------\n`
      payload += `[C]TOTAL AMT : ${totalAmount}\n`
      payload += `[C]----------------------------\n`

      await ThermalPrinterModule.printBluetooth({
        payload,
        printerNbrCharactersPerLine: 32,
        printerDpi: 120,
        printerWidthMM: 58,
        mmFeedPaper: 25,
      })
      // navigation.dispatch(
      //   CommonActions.navigate({
      //     name: mainNavigationRoutes.printScreen,
      //     params: { textData: payload },
      //   }),
      // )
    } catch (e) {
      console.log(e.message || e)
    }
  }

  const printDayScrollReportPaxA910 = async (
    bankName,
    branchName,
    agentName,
    startDate,
    endDate,
    tableData,
    totalAmount,
  ) => {
    try {
      let payload = `[C]${bankName}\n`
      payload += `[C]${branchName}\n`
      payload += `[L]DATE:[R]${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })}\n`
      payload += `[L]AGENT:[R]${agentName?.slice(0, 12)}\n`
      payload += `[C]----------------------------\n`
      payload += `[C]DAY SCROLL REPORT\n`

      payload += `[L]FROM:${new Date(startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })}[R]TO:${new Date(endDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })}\n`
      payload += `[C]----------------------------\n`

      payload += `[L]A/C [C]NAME [R]AMT\n`

      tableData.forEach(row => {
        const [, , , acct, name, amt] = row
        const acctStr = acct.toString().slice(-6)
        const nameStr = name.toString().slice(0, 10)
        payload += `[L]${acctStr}[C]${nameStr}[R]${amt}\n`
      })

      payload += `[C]----------------------------\n`
      payload += `[C]TOTAL AMT : ${totalAmount}\n`
      payload += `[C]----------------------------\n`

      await ThermalPrinterModule.printBluetooth({
        payload,
        printerNbrCharactersPerLine: 32,
        printerDpi: 120,
        printerWidthMM: 58,
        mmFeedPaper: 25,
      })
      // navigation.dispatch(
      //   CommonActions.navigate({
      //     name: mainNavigationRoutes.printScreen,
      //     params: { textData: payload },
      //   }),
      // )
    } catch (e) {
      console.error("Printing error:", e.message || e)
    }
  }

  const printDatewiseCollectionSummaryPaxA910 = async (
    bankName,
    branchName,
    dtWiseCollSummaryArray,
    totalReceipts,
    total,
  ) => {
    try {
      let payload = `[C]${bankName}\n`
      payload += `[C]${branchName}\n`
      payload += `[L]DATE:[R]${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })}\n`
      payload += `[C]----------------------------\n`
      payload += `[C]SUMMARY REPORT\n`
      payload += `[C]----------------------------\n`
      payload += `[L]DATE [C]RCPTS [R]COLL AMT\n`

      dtWiseCollSummaryArray.forEach(row => {
        const data = removeIndexes([...row], [0]).join("        ")
        payload += `[L]${data}\n`
      })

      payload += `[C]----------------------------\n`
      payload += `[C]TOTAL RCPTS : ${totalReceipts}\n`
      payload += `[C]TOTAL AMT : ${total}\n`
      payload += `[C]----------------------------\n`

      await ThermalPrinterModule.printBluetooth({
        payload,
        printerNbrCharactersPerLine: 32,
        printerDpi: 120,
        printerWidthMM: 58,
        mmFeedPaper: 25,
      })

      // navigation.dispatch(
      //   CommonActions.navigate({
      //     name: mainNavigationRoutes.printScreen,
      //     params: { textData: payload },
      //   }),
      // )
    } catch (e) {
      console.log(e.message || e)
    }
  }

  return {
    printReceiptPaxA910,
    printDuplicateReceiptPaxA910,
    printMiniStatementPaxA910,
    printDayScrollReportPaxA910,
    printDatewiseCollectionSummaryPaxA910,
  }
}
