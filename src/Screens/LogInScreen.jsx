import {
  StyleSheet,
  Text,
  View,
  PixelRatio,
  TouchableOpacity,
  Image,
  ToastAndroid,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native"
import { useState, useEffect, useContext, useCallback } from "react"
import { COLORS, colors } from "../Resources/colors"
import InputComponent from "../Components/InputComponent"
import { Strings } from "../Resources/Strings"
import ButtonComponent from "../Components/ButtonComponent"
import mainNavigationRoutes from "../Routes/NavigationRoutes"
import { AppStore } from "../Context/AppContext"
import SmoothPinCodeInput from "react-native-smooth-pincode-input"
import HeaderImage from "../Resources/Images/logo_cut.png"
import HeaderLogo from "../Resources/Images/headerlogo.png"
import { useFocusEffect } from "@react-navigation/native"
import DeviceInfo from "react-native-device-info"
import axios from "axios"
import { address } from "../Routes/addresses"
import CancelButtonComponent from "../Components/CancelButtonComponent"
// import RNEzetapSdk from "react-native-ezetap-sdk"
// import { ezetapStorage, printerFlagStorage } from "../storage/appStorage"
// import { printingSDKType } from "../PrintingAgents/config"

const LogInScreen = ({ navigation }) => {
  const {
    isLogin,
    login,
    userId,
    agentName,
    getUserId,
    deviceId,
    setDeviceId,
    passcode,
    setPasscode,
    next,
    setNext,
  } = useContext(AppStore)

  const [latestAppVersion, setLatestAppVersion] = useState("")
  const [appDownloadLink, setAppDownloadLink] = useState("")
  const [updateStatus, setUpdateStatus] = useState("")
  const [isDisable, setDisable] = useState(false)
  // useEffect(() => {
  //   console.log(passcode)
  // }, [passcode])

  const handlePressOnFirstScreen = () => {
    if (userId) {
      setNext(true)
    } else {
      setNext(false)
      ToastAndroid.showWithGravityAndOffset(
        "We encountered some error on server.",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
        25,
        50,
      )
    }
  }

  let version = DeviceInfo.getVersion()

  const [latestMajor, latestMinor, latestPatch] = latestAppVersion
    .split(".")
    .map(s => parseInt(s, 10))
  const [currentMajor, currentMinor, currentPatch] = version
    .split(".")
    .map(s => parseInt(s, 10))

  // const getVersionFromWeb = async () => {
  //   await axios
  //     .post(
  //       address.GET_VERSION_DETAILS,
  //       { app_version: version },
  //       {
  //         headers: {
  //           Accept: "application/json",
  //         },
  //       },
  //     )
  //     .then(res => {
  //       setLatestAppVersion(res?.data?.data?.app_version)
  //       setAppDownloadLink(res?.data?.data?.app_download_link)
  //       console.log(
  //         "fsdadgtreyhgtdhyrfujfyudx",
  //         res.data.data.app_download_link,
  //       )
  //       console.log("fsdadgtreyhgtdhysdfsdfsdrfujfyudx", res.data)
  //       setUpdateStatus(res.data.update_status)

  //       if (res.data.update_status == "Y") {
  //         showAlertUpdate(res?.data?.data?.app_download_link)
  //       }
  //     })
  // }

  // const printerFlagCheck = async () => {
  //   const creds = {
  //     device_id: deviceId,
  //     user_id: userId,
  //   }

  //   console.log("PAYLOAD PRINT FLAGGG", creds)

  //   await axios
  //     .post(address.PRINTER_FLAG, creds)
  //     .then(res => {
  //       console.log("PRINTER FLAG RESSSSSS =======>>>>", res?.data)
  //       console.log(
  //         "PRINTER FLAG RESSSSSS =======>>>> RES?.DATA?.MSG",
  //         res?.data?.success?.msg,
  //       )
  //       printerFlagStorage.set(
  //         "printer-flag-json",
  //         JSON.stringify(res?.data?.success?.msg),
  //       )
  //     })
  //     .catch(err => {
  //       console.log("Some error occurred while fetching flag.", err)
  //     })
  // }

  // const initRazorpay = async () => {
  //   // Debug Device
  //   // var withAppKey =
  //   //   '{"userName":' +
  //   //   "9903044748" +
  //   //   ',"demoAppKey":"a40c761a-b664-4bc6-ab5a-bf073aa797d5","prodAppKey":"a40c761a-b664-4bc6-ab5a-bf073aa797d5","merchantName":"SYNERGIC_SOFTEK_SOLUTIONS","appMode":"DEMO","currencyCode":"INR","captureSignature":false,"prepareDevice":false}'

  //   // Release Device
  //   var withAppKey =
  //     '{"userName":' +
  //     "5551713830" +
  //     ',"demoAppKey":"821595fb-c14f-4cff-9fb5-c229b4f3325d","prodAppKey":"821595fb-c14f-4cff-9fb5-c229b4f3325d","merchantName":"NILACHAKRA_MULTIPURPOSE_C","appMode":"PROD","currencyCode":"INR","captureSignature":false,"prepareDevice":false}'
  //   var response = await RNEzetapSdk.initialize(withAppKey)
  //   console.log(response)
  //   // var jsonData = JSON.parse(response)
  //   // setRazorpayInitializationJson(jsonData)
  //   ezetapStorage.set("ezetap-initialization-json", response)
  // }

  // const init = async () => {
  //   getUserId()
  //   getVersionFromWeb()

  //   console.log(
  //     "PPPPPPPPPPPPPPPPPPPPPPPPPPPPP",
  //     ezetapStorage.contains("ezetap-initialization-json"),
  //     ezetapStorage.getString("ezetap-initialization-json"),
  //   )
  //   // if (!ezetapStorage.contains("ezetap-initialization-json")) {
  //   await initRazorpay()

  //   var res = await RNEzetapSdk.prepareDevice()
  //   console.warn("RAZORPAY===PREPARE DEVICE", res)
  //   // }
  // }

  const masterCallingFuncSequence = async () => {
    await getUserId()
    // await getVersionFromWeb()
    // await printerFlagCheck()

    // if (printingSDKType.paxA910) {
    //   // init()
    // }
  }

  useEffect(() => {
    masterCallingFuncSequence()
  }, [userId, deviceId])

  console.log("skahlrcnsfytkuwhnf ", version)
  console.log("skahlrcnsfytkuwhnf ", latestAppVersion)
  console.log("skahlrcnsfytkuwhnf ", updateStatus)

  // function showAlertUpdate(link) {
  //   Alert.alert("Found Update!", "Please update your app.", [
  //     { text: "Download", onPress: () => Linking.openURL(link) },
  //   ])
  // }

  // 1 3 0 ========= 1 1 0

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightScheme.background }}>
      <View style={styles.logoContainer}>
        <Image source={HeaderLogo} style={styles.image} resizeMode="contain" />
        <View>
          {/* Wellcome gretting */}
          <Text style={styles.grettingText}>Welcome to {"Data Bank"}</Text>
          {/* manual text */}
          <Text style={styles.manual}>Login with your pin</Text>
          <Text style={styles.manual}>Version: {version}</Text>
        </View>
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.logINcontainer}>
          {/* Title */}
          <Text style={styles.title}>LOGIN</Text>

          {!next && (
            <View>
              {/* DeviceId */}
              {!userId && (
                <InputComponent
                  // handleChange={() => { }}
                  value={deviceId ? deviceId : "Fetching ID..."}
                  placeholder={Strings.loginPlaceHolder}
                  label={"Device ID"}
                  readOnly={true}
                />
              )}
              {/* Agent ID */}
              <InputComponent
                // handleChange={handlePressOnFirstScreen}
                value={userId ? userId : "Fetching ID..."}
                placeholder={`${userId}`}
                label={"Agent ID"}
                readOnly={true}
              />
              {/* <InputComponent
                // handleChange={handlePressOnFirstScreen}
                value={agentName ? agentName : "Fetching Username..."}
                placeholder={`${agentName}`}
                label={'Agent Name'}
                readOnly={true}
              /> */}

              <View style={styles.buttonContainer}>
                <ButtonComponent
                  disabled={updateStatus == "Y" || !userId ? true : false}
                  title={"Next"}
                  handleOnpress={() => handlePressOnFirstScreen()}
                  customStyle={{ width: "60%", marginTop: 10 }}
                />
              </View>

              {/* {updateStatus && (
                <View style={styles.buttonContainer}>
                  <ButtonComponent
                    title={"Download Update"}
                    handleOnpress={() => {
                      showAlertUpdate()
                    }}
                    customStyle={{ width: "80%" }}
                  />
                </View>
              )} */}
            </View>
          )}

          {next && (
            <View>
              {/* Passcode */}
              <View style={{ padding: 10, alignItems: "center" }}>
                <SmoothPinCodeInput
                  autoFocus={true}
                  placeholder="?"
                  mask={
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 25,
                        backgroundColor: COLORS.lightScheme.primary,
                      }}></View>
                  }
                  maskDelay={1000}
                  password={true}
                  cellStyle={{
                    borderWidth: 1,
                    borderRadius: 5,
                    borderColor: COLORS.lightScheme.secondary,
                  }}
                  cellStyleFocused={null}
                  value={passcode}
                  onTextChange={code => {
                    setPasscode(code)
                  }}
                  onBackspace={() => {
                    // console.warn("hello")
                  }}
                />
              </View>

              {/* Forgot Pin */}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(mainNavigationRoutes.forgotPasscode)
                }>
                <Text style={styles.resetText}>Forgot Pin?</Text>
              </TouchableOpacity>
              <View style={styles.buttonContainer}>
                <CancelButtonComponent
                  title={"Back"}
                  handleOnpress={() => {
                    setNext(!next)
                    setDisable(false)
                  }}
                  customStyle={{
                    marginTop: 10,
                    backgroundColor: "white",
                    colors: "red",
                    width: "40%",
                  }}
                />
                <ButtonComponent
                  disabled={isDisable || passcode.length != 4}
                  title={
                    !isDisable ? (
                      "Submit"
                    ) : (
                      <ActivityIndicator color={COLORS.lightScheme.primary} />
                    )
                  }
                  handleOnpress={async () => {
                    setDisable(true)
                    let k = await login()
                    setDisable(false)
                  }}
                  customStyle={{ marginTop: 10, width: "40%" }}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default LogInScreen

const styles = StyleSheet.create({
  logoContainer: {
    flex: 2,
    backgroundColor: COLORS.lightScheme.primary,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    color: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  grettingText: {
    fontSize: 18,
    color: COLORS.lightScheme.onPrimary,
    letterSpacing: 1,
    fontWeight: "900",
  },
  manual: {
    fontSize: 14,
    color: COLORS.lightScheme.onPrimary,
    letterSpacing: 1,
    fontWeight: "900",
    alignSelf: "center",
  },

  mainContainer: {
    flex: 4,
  },
  logINcontainer: {
    width: "100%",
    backgroundColor: COLORS.lightScheme.background,

    padding: PixelRatio.roundToNearestPixel(10),
    borderRadius: PixelRatio.roundToNearestPixel(10),
    shadowColor: COLORS.lightScheme.onTertiaryContainer,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
    position: "absolute",
    bottom: 1,
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.lightScheme.tertiaryContainer,
    // alignSelf: 'center',
    letterSpacing: 4,
    backgroundColor: COLORS.lightScheme.primary,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderTopLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  buttonContainer: {
    width: "100px",
    marginVertical: 5,
    padding: 5,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  resetText: {
    textAlign: "center",
    color: COLORS.lightScheme.primary,
    fontSize: 16,
    alignSelf: "flex-end",
    paddingHorizontal: 6,
    letterSpacing: 1,
    marginTop: 10,
    fontWeight: "700",
  },
  image: {
    width: 150,
    height: 150,
  },
})
