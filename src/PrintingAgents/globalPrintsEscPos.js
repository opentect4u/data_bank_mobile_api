import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer"
import { removeIndexes } from "../Functions/removeIndexes"

async function printReceiptEscPos(
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
      // ["RCPT NO", ":", rcptNo.toString().substring(0, 6)],
      ["RCPT NO", ":", rcptNo.toString().slice(-6)],
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
        lastTnxDate // this is shit -> to be changed later
          ? new Date(lastTnxDate) // this is shit -> -> to be changed later
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
  }
}

async function printDuplicateReceiptEscPos(
  item,
  bankName,
  branchName,
  agentName,
  prevTnxDate,
) {
  console.log(item)
  try {
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    )
    await BluetoothEscposPrinter.printText(bankName, { align: "center" })
    await BluetoothEscposPrinter.printText("\r\n", {})
    await BluetoothEscposPrinter.printText(branchName, { align: "center" })
    await BluetoothEscposPrinter.printText("\r\n", {})

    await BluetoothEscposPrinter.printText("DUPLICATE RECEIPT", {
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
          new Date(item?.collected_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }) +
          ", " +
          new Date(item?.collected_at).toLocaleTimeString("en-GB", {
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
      // ["RCPT NO", ":", item?.receipt_no.toString().substring(0, 6)],
      ["RCPT NO", ":", item?.receipt_no.toString().slice(-6)],
      {},
    )

    await BluetoothEscposPrinter.printColumn(
      columnWidths,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ["ACC NO", ":", item?.account_number],
      {},
    )

    await BluetoothEscposPrinter.printColumn(
      columnWidths,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ["NAME", ":", item?.account_holder_name],
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
        item?.account_type == "L" ? "PREV BAL" : "OPEN BAL",
        ":",
        item?.opening_bal.toString(),
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
      ["COLL AMT", ":", item?.deposit_amount.toString()],
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
        item?.account_type == "L" ? "CURR BAL" : "CLOSE BAL",
        ":",
        item?.closing_bal.toString(),
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
        prevTnxDate
          ? new Date(prevTnxDate)
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

    await BluetoothEscposPrinter.printText(
      "---------------X---------------",
      {},
    )

    await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {})
  } catch (e) {
    console.log(e.message || "ERROR")
    // console.log( "ERROR")
    // ToastAndroid.showWithGravityAndOffset(
    //   "Printer not connected.",
    //   ToastAndroid.SHORT,
    //   ToastAndroid.CENTER,
    //   25,
    //   50,
    // )
  }
}

async function printMiniStatementEscPos(
  item,
  bankName,
  branchName,
  agentName,
  tableData,
  totalAmount,
) {
  try {
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    )
    await BluetoothEscposPrinter.printText(bankName, { align: "center" })
    await BluetoothEscposPrinter.printText("\r\n", {})
    await BluetoothEscposPrinter.printText(branchName, { align: "center" })
    await BluetoothEscposPrinter.printText("\r\n", {})
    await BluetoothEscposPrinter.printColumn(
      [10, 2, 18],
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      [
        "Date",
        ":",
        new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
          .toString(),
      ],
      {},
    )
    await BluetoothEscposPrinter.printColumn(
      [10, 2, 18],
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ["Agent", ":", agentName],
      {},
    )
    await BluetoothEscposPrinter.printColumn(
      [10, 2, 18],
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ["Cus Name", ":", item.customer_name],
      {},
    )

    await BluetoothEscposPrinter.printColumn(
      [10, 2, 18],
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ["Acc No", ":", item.account_number],
      {},
    )

    await BluetoothEscposPrinter.printText(
      "-------------------------------\n",
      {},
    )

    await BluetoothEscposPrinter.printText("MINI STATEMENT\n", {
      align: "center",
    })

    // await BluetoothEscposPrinter.printText(`FROM: ${new Date(startDate).toLocaleDateString("en-GB", {day: "2-digit", month: "2-digit", year: "2-digit"})}  TO: ${new Date(endDate).toLocaleDateString("en-GB", {day: "2-digit", month: "2-digit", year: "2-digit"})}`, {
    //   align: "center",
    // })

    await BluetoothEscposPrinter.printText("\r", {})

    // await BluetoothEscposPrinter.printPic(logo, { width: 300, align: "center", left: 30 })

    await BluetoothEscposPrinter.printText(
      "-------------------------------",
      {},
    )
    await BluetoothEscposPrinter.printText("\r\n", {})

    let columnWidthsHeader = [10, 10, 10]
    await BluetoothEscposPrinter.printColumn(
      columnWidthsHeader,
      [
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.CENTER,
      ],
      ["Date", "Coll Amt", "Cls Bal"],
      {},
    )

    const copiedTableData = [...tableData]
    console.log("TABLLLELEEEEE DDDAAATAAAA  CPPPYYY ", copiedTableData)

    let columnWidthsBody = [30]
    copiedTableData.forEach(async item => {
      let newItems = [...item]
      console.log("new itemsssssss", newItems)
      const updatedItems = removeIndexes(newItems, [0])

      // updatedItems[2] = updatedItems[2].slice(0, 8)
      let items = updatedItems.join("     ")
      console.log("++==++ PRINTED ITEM", items)
      await BluetoothEscposPrinter.printColumn(
        columnWidthsBody,
        [BluetoothEscposPrinter.ALIGN.CENTER],
        [items.toString()],
        {},
      )
    })

    await BluetoothEscposPrinter.printText(
      "-------------------------------\n",
      {},
    )

    await BluetoothEscposPrinter.printText(`TOTAL AMOUNT: ${totalAmount}\r\n`, {
      align: "center",
    })
    // await BluetoothEscposPrinter.printText("Total Receipts: " + totalReceipts + "\n", { align: "center" })
    // await BluetoothEscposPrinter.printText("Total Amount: " + total + "\n", { align: "center" })
    await BluetoothEscposPrinter.printText(
      "---------------X---------------",
      {},
    )

    await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {})
  } catch (e) {
    console.log(e.message || "ERROR")
    ToastAndroid.showWithGravityAndOffset(
      "Printer not connected.",
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
      25,
      50,
    )
  }
}

async function printDayScrollReportEscPos(
  bankName,
  branchName,
  agentName,
  startDate,
  endDate,
  tableData,
  totalAmount,
) {
  try {
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    )
    await BluetoothEscposPrinter.printText(bankName, { align: "center" })
    await BluetoothEscposPrinter.printText("\r\n", {})
    await BluetoothEscposPrinter.printText(branchName, { align: "center" })
    await BluetoothEscposPrinter.printText("\r\n", {})
    await BluetoothEscposPrinter.printColumn(
      [10, 2, 18],
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      [
        "Date",
        ":",
        new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
          .toString(),
      ],
      {},
    )
    await BluetoothEscposPrinter.printColumn(
      [10, 2, 18],
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ["Agent", ":", agentName],
      {},
    )

    await BluetoothEscposPrinter.printText(
      "-------------------------------\n",
      {},
    )

    await BluetoothEscposPrinter.printText("DAY SCROLL REPORT\r\n", {
      align: "center",
    })

    await BluetoothEscposPrinter.printText(
      `FROM: ${new Date(startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })}  TO: ${new Date(endDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })}`,
      {
        align: "center",
      },
    )

    await BluetoothEscposPrinter.printText("\r", {})

    // await BluetoothEscposPrinter.printPic(logo, { width: 300, align: "center", left: 30 })

    await BluetoothEscposPrinter.printText(
      "-------------------------------",
      {},
    )
    await BluetoothEscposPrinter.printText("\r\n", {})

    let columnWidthsHeader = [10, 10, 10]
    await BluetoothEscposPrinter.printColumn(
      columnWidthsHeader,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      // ["Date", "A/c No", "Amt"],
      ["A/c No", "Name", "Amt"],
      {},
    )

    const copiedTableData = [...tableData]
    console.log("TABLLLELEEEEE DDDAAATAAAA  CPPPYYY ", copiedTableData)

    let columnWidthsBody = [13, 12, 7]
    copiedTableData.forEach(async item => {
      let newItems = [...item]
      console.log("new itemsssssss", newItems)
      // const updatedItems = removeIndexes(newItems, [0, 2, 4])
      const updatedItems = removeIndexes(newItems, [0, 1, 2])

      // updatedItems[2] = updatedItems[2].slice(0, 8)
      // let items = updatedItems.join(" ")
      // console.log("++==++ PRINTED ITEM", items)
      console.log("++==++ PRINTED ITEM", updatedItems)
      await BluetoothEscposPrinter.printColumn(
        columnWidthsBody,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [
          updatedItems[0].toString(),
          updatedItems[1].toString(),
          updatedItems[2].toString(),
        ],
        {},
      )
    })

    await BluetoothEscposPrinter.printText(
      "-------------------------------\n",
      {},
    )

    await BluetoothEscposPrinter.printText(`TOTAL AMOUNT: ${totalAmount}\r\n`, {
      align: "center",
    })
    // await BluetoothEscposPrinter.printText("Total Receipts: " + totalReceipts + "\n", { align: "center" })
    // await BluetoothEscposPrinter.printText("Total Amount: " + total + "\n", { align: "center" })
    await BluetoothEscposPrinter.printText(
      "---------------X---------------",
      {},
    )

    await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {})
  } catch (e) {
    console.log(e.message || "ERROR")
    ToastAndroid.showWithGravityAndOffset(
      "Printer not connected.",
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
      25,
      50,
    )
  }
}

async function printDatewiseCollectionSummaryEscPos(
  bankName,
  branchName,
  dtWiseCollSummaryArray,
  totalReceipts,
  total,
) {
  try {
    // await BluetoothEscposPrinter.printerAlign(
    //   BluetoothEscposPrinter.ALIGN.CENTER,
    // )
    await BluetoothEscposPrinter.printText(bankName, { align: "center" })
    await BluetoothEscposPrinter.printText("\r\n", {})
    await BluetoothEscposPrinter.printText(branchName, { align: "center" })
    await BluetoothEscposPrinter.printText("\r\n", {})

    await BluetoothEscposPrinter.printColumn(
      [10, 2, 18],
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      [
        "Date",
        ":",
        new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
          .toString(),
      ],
      {},
    )

    await BluetoothEscposPrinter.printText(
      "-------------------------------\n",
      {},
    )

    await BluetoothEscposPrinter.printText("SUMMARY REPORT", {
      align: "center",
    })

    await BluetoothEscposPrinter.printText("\r", {})

    // await BluetoothEscposPrinter.printPic(logo, { width: 300, align: "center", left: 30 })

    await BluetoothEscposPrinter.printText(
      "-------------------------------",
      {},
    )
    await BluetoothEscposPrinter.printText("\r\n", {})

    let columnWidthsHeader = [10, 6, 10]
    await BluetoothEscposPrinter.printColumn(
      columnWidthsHeader,
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ["Date", "Rcpts", "Coll Amt"],
      {},
    )

    let columnWidthsBody = [30]
    dtWiseCollSummaryArray.forEach(async item => {
      let newItems = [...item]
      newItems.shift()
      let items = newItems.join("      ")
      console.log("++==++ PRINTED ITEM", items)
      await BluetoothEscposPrinter.printColumn(
        columnWidthsBody,
        [BluetoothEscposPrinter.ALIGN.CENTER],
        [items.toString()],
        {},
      )
    })

    await BluetoothEscposPrinter.printText(
      "-------------------------------\n",
      {},
    )
    await BluetoothEscposPrinter.printText(
      "Total Receipts: " + totalReceipts + "\n",
      { align: "center" },
    )
    await BluetoothEscposPrinter.printText("Total Amount: " + total + "\n", {
      align: "center",
    })
    await BluetoothEscposPrinter.printText(
      "---------------X---------------",
      {},
    )

    await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {})
  } catch (e) {
    console.log(e.message || "ERROR")
  }
}

export {
  printReceiptEscPos,
  printDuplicateReceiptEscPos,
  printMiniStatementEscPos,
  printDayScrollReportEscPos,
  printDatewiseCollectionSummaryEscPos,
}
