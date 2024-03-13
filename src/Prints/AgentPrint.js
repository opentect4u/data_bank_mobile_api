import { useContext } from "react"
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer"
import { AppStore } from "../Context/AppContext"


export const printAgentInfo = async () => {
  const {
    userId,
    agentName,
    bankName,
    branchName,
    totalCollection,
    getTotalDepositAmount,
    login,
  } = useContext(AppStore)

  try {
    await BluetoothEscposPrinter.printerAlign(
      BluetoothEscposPrinter.ALIGN.CENTER,
    )
    await BluetoothEscposPrinter.printText("Data Bank", { align: "center" })
    await BluetoothEscposPrinter.printText("\r\n", {})
    await BluetoothEscposPrinter.printText(branchName, { align: "center" })
    await BluetoothEscposPrinter.printText("\r\n", {})

    await BluetoothEscposPrinter.printText("AGENT INFORMATION", { align: "center" })

    await BluetoothEscposPrinter.printText("\r\n\r\n", {})
    await BluetoothEscposPrinter.printText("-------------------------------", {})
    await BluetoothEscposPrinter.printText("\r\n", {})

    await BluetoothEscposPrinter.printColumn(
      [48],
      [BluetoothEscposPrinter.ALIGN.LEFT],
      ["Agent Name: " + agentName],
      {},
    )

    await BluetoothEscposPrinter.printColumn(
      [48],
      [BluetoothEscposPrinter.ALIGN.LEFT],
      ["Agent Code: " + userId],
      {},
    )

    await BluetoothEscposPrinter.printColumn(
      [48],
      [BluetoothEscposPrinter.ALIGN.LEFT],
      ["Date: " + currentDateTime.toLocaleDateString("en-GB")],
      {},
    )

    await BluetoothEscposPrinter.printText("\r\n", {})

    await BluetoothEscposPrinter.printColumn(
      [48],
      [BluetoothEscposPrinter.ALIGN.LEFT],
      ["Total Collection: " + totalCollection + "/-"],
      {},
    )

    // await BluetoothEscposPrinter.printText("\r\n", {})
    await BluetoothEscposPrinter.printText("---------------X---------------", {})

    // await BluetoothEscposPrinter.printColumn(
    //   [48],
    //   [BluetoothEscposPrinter.ALIGN.LEFT],
    //   ["Telephone:" + telephone],
    //   {},
    // )

    // await BluetoothEscposPrinter.printColumn(
    //   [48],
    //   [BluetoothEscposPrinter.ALIGN.LEFT],
    //   ["Salesman:" + salesman],
    //   {},
    // )

    // await BluetoothEscposPrinter.printColumn(
    //   [48],
    //   [BluetoothEscposPrinter.ALIGN.LEFT],
    //   ["Product Code:" + productCode],
    //   {},
    // )

    // await BluetoothEscposPrinter.printText("\r\n", {})

    // await BluetoothEscposPrinter.printColumn(
    //   [48],
    //   [BluetoothEscposPrinter.ALIGN.LEFT],
    //   ["Amount:" + amount + "/="],
    //   {},
    // )

    // await BluetoothEscposPrinter.printColumn(
    //   [48],
    //   [BluetoothEscposPrinter.ALIGN.LEFT],
    //   ["Discount:" + discount + "/="],
    //   {},
    // )

    // await BluetoothEscposPrinter.printColumn(
    //   [48],
    //   [BluetoothEscposPrinter.ALIGN.LEFT],
    //   ["Amount Received:" + amountReceived + "/="],
    //   {},
    // )

    // await BluetoothEscposPrinter.printColumn(
    //   [48],
    //   [BluetoothEscposPrinter.ALIGN.LEFT],
    //   ["Payment Method:" + paymentMethod],
    //   {},
    // )

    // await BluetoothEscposPrinter.printText("\r\n", {})

    // await BluetoothEscposPrinter.printColumn(
    //   [48],
    //   [BluetoothEscposPrinter.ALIGN.LEFT],
    //   ["Received From:" + receivedFrom],
    //   {},
    // )

    // await BluetoothEscposPrinter.printText("\r\n", {})

    // await BluetoothEscposPrinter.printColumn(
    //   [48],
    //   [BluetoothEscposPrinter.ALIGN.LEFT],
    //   ["Signature:" + "..................."],
    //   {},
    // )

    // await BluetoothEscposPrinter.printColumn(
    //   [48],
    //   [BluetoothEscposPrinter.ALIGN.LEFT],
    //   ["Printed By:" + fcuser],
    //   {},
    // )

    await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {})
    // await BluetoothEscposPrinter.printQRCode("Something", 25, 3)
  } catch (e) {
    alert(e.message || "ERROR")
  }
}