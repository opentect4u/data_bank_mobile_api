import { printerFlagStorage } from "../storage/appStorage"

const printingSDKType = {
  escpos:
    JSON.parse(printerFlagStorage.getString("printer-flag-json"))[0]
      ?.printer_type === "ESCPOS",
  paxA910:
    JSON.parse(printerFlagStorage.getString("printer-flag-json"))[0]
      ?.printer_type === "PAXA910",
}

export { printingSDKType }
