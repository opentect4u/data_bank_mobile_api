import { MMKV } from "react-native-mmkv"

export const ezetapStorage = new MMKV({
  id: "ezetap-store",
})

export const printerFlagStorage = new MMKV({
  id: "printer-store",
})

export const logoStorage = new MMKV({
  id: "logo-store",
})
