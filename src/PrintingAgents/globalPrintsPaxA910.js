import ThermalPrinterModule from "react-native-thermal-printer"
import { removeIndexes } from "../Functions/removeIndexes"

async function printReceiptPaxA910(
  rcptNo,
  item,
  bankName,
  branchName,
  agentName,
  todayDT,
  money,
  lastTnxDate,
) {
  try {
    // let payload = `[C]<img>https://synergicportal.in/claim/Slogo2.png</img>\n`
    // let payload = `[C]<img>file:///android_asset/Slogo2.png</img>\n`
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
      `[L]<b>RCPT NO    : [R]${rcptNo.toString().slice(-6)}\n` +
      `[L]<b>A/C NO     : [R]${(item?.account_number).toString()}\n` +
      `[L]<b>NAME       : [R]${item?.customer_name.toString()}\n` +
      `[L]<b>${
        item?.acc_type == "L" ? "PREV BAL" : "OPEN BAL"
      }   : [R]${(item?.current_balance).toString()}\n` +
      `[L]<b>COLL AMT   : [R]${money.toString()}\n` +
      `[L]<b>${item?.acc_type == "L" ? "CURR BAL " : "CLOSE BAL"}  : [R]${
        item?.acc_type == "L"
          ? parseFloat(item?.current_balance - parseFloat(money)).toString()
          : parseFloat(item?.current_balance + parseFloat(money)).toString()
      }\n` +
      `[L]<b>PRV TNX DT : [R]${
        lastTnxDate
          ? new Date(lastTnxDate).toLocaleDateString("en-GB", {
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

    payload += `[C]<font size='big'>--------------</font>\n`
    payload += `[C]                                      \n`

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

async function printDuplicateReceiptPaxA910(
  item,
  bankName,
  branchName,
  agentName,
  prevTnxDate,
) {
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
      `[L]<b>RCPT NO    : [R]${item?.receipt_no.toString().slice(-6)}\n` +
      `[L]<b>A/C NO     : [R]${item?.account_number?.toString()}\n` +
      `[L]<b>NAME       : [R]${item?.account_holder_name?.toString()}\n` +
      `[L]<b>${
        item?.account_type == "L" ? "PREV BAL" : "OPEN BAL"
      }   : [R]${item?.opening_bal?.toString()}\n` +
      `[L]<b>COLL AMT   : [R]${item?.deposit_amount?.toString()}\n` +
      `[L]<b>${
        item?.account_type == "L" ? "CURR BAL " : "CLOSE BAL"
      }  : [R]${parseFloat(item?.closing_bal?.toString())?.toString()}\n` +
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

    payload += `[C]<font size='big'>--------------</font>\n`
    payload += `[C]                                      \n`

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

async function printMiniStatementPaxA910(
  item,
  bankName,
  branchName,
  agentName,
  tableData,
  totalAmount,
) {
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
    // payload += `[L]FROM: ${new Date(startDate).toLocaleDateString("en-GB", {
    //   day: "2-digit",
    //   month: "2-digit",
    //   year: "2-digit",
    // })} [R]TO: ${new Date(endDate).toLocaleDateString("en-GB", {
    //   day: "2-digit",
    //   month: "2-digit",
    //   year: "2-digit",
    // })}\n`
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
    payload += `[C]<font size='big'><B>--------------</font>\n`
    payload += `[C]                                         \n`

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

async function printDayScrollReportPaxA910(
  bankName,
  branchName,
  agentName,
  startDate,
  endDate,
  tableData,
  totalAmount,
) {
  try {
    let payload = `[C]<font size='normal'>${bankName}</font>\n`
    payload += `[C]<font size='normal'>${branchName}</font>\n`
    // payload += `[C]<font size='normal'>RECEIPT</font>\n`
    // payload += `[C]<font size='big'><B>--------------</font>\n`
    payload += `[L]<b>DATE    : [R]${new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .toString()}\n`

    payload += `[L]<b>AGENT   : [R]${agentName}\n`
    payload += `[C]<font size='big'><B>--------------</font>\n`
    payload += `[C]<b>DAY SCROLL REPORT\n`
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
    payload += `[L]A/C [C]NAME [R]AMT\n`

    const copiedTableData = [...tableData]
    console.log("TABLLLELEEEEE DDDAAATAAAA  CPPPYYY ", copiedTableData)

    copiedTableData.forEach(async item => {
      let newItems = [...item]
      console.log("new itemsssssss", newItems)
      // const updatedItems = removeIndexes(newItems, [0, 2, 4])
      const updatedItems = removeIndexes(newItems, [0, 1, 2])

      // updatedItems[2] = updatedItems[2].slice(0, 8)
      // let items = updatedItems.join(" ")
      // console.log("++==++ PRINTED ITEM", items)
      console.log("++==++ PRINTED ITEM", updatedItems)

      payload += `[L]${updatedItems[0]
        .toString()
        .substring(updatedItems[0].toString()?.length - 6)} [C]${updatedItems[1]
        .toString()
        .substring(0, 10)} [R]${updatedItems[2].toString()}\n`
    })

    payload += `[C]<font size='big'><B>--------------</font>\n`
    payload += `[C]TOTAL AMT : ${totalAmount}\n`
    payload += `[C]<font size='big'><B>--------------</font>\n`
    payload += `[C]                                         \n`

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

async function printDatewiseCollectionSummaryPaxA910(
  bankName,
  branchName,
  dtWiseCollSummaryArray,
  totalReceipts,
  total,
) {
  try {
    let payload = `[C]<font size='normal'>${bankName}</font>\n`
    payload += `[C]<font size='normal'>${branchName}</font>\n`
    // payload += `[C]<font size='normal'>RECEIPT</font>\n`
    // payload += `[C]<font size='big'><B>--------------</font>\n`
    payload += `[L]<b>DATE    : [R]${new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .toString()}\n`

    // payload += `[L]<b>AGENT   : [R]${agentName}\n`
    payload += `[C]<font size='big'><B>--------------</font>\n`
    payload += `[C]<b>SUMMARY REPORT\n`
    // payload += `[L]FROM: ${new Date(startDate).toLocaleDateString("en-GB", {
    //   day: "2-digit",
    //   month: "2-digit",
    //   year: "2-digit",
    // })} [R]TO: ${new Date(endDate).toLocaleDateString("en-GB", {
    //   day: "2-digit",
    //   month: "2-digit",
    //   year: "2-digit",
    // })}\n`
    payload += `[C]<font size='big'><B>--------------</font>\n`
    payload += `[L]DATE [C]RCPTS [R]COLL AMT\n`

    dtWiseCollSummaryArray.forEach(async item => {
      let newItems = [...item]
      newItems.shift()
      let items = newItems.join("        ")
      console.log("++==++ PRINTED ITEM", items)

      payload += `[L]${items.toString()}\n`
    })

    payload += `[C]<font size='big'><B>--------------</font>\n`
    payload += `[C]TOTAL RCPTS : ${totalReceipts}\n`
    payload += `[C]TOTAL AMT : ${total}\n`
    payload += `[C]<font size='big'><B>--------------</font>\n`
    payload += `[C]                                         \n`

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

export {
  printReceiptPaxA910,
  printDuplicateReceiptPaxA910,
  printMiniStatementPaxA910,
  printDayScrollReportPaxA910,
  printDatewiseCollectionSummaryPaxA910,
}
