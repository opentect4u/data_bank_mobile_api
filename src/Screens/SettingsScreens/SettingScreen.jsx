import {
  PixelRatio,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { icon } from "../../Resources/Icons"
import { COLORS, colors } from "../../Resources/colors"
import CustomHeader from "../../Components/CustomHeader"
import mainNavigationRoutes from "../../Routes/NavigationRoutes"
import { StackActions, useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"
import { printingSDKType } from "../../PrintingAgents/config"

const SettingScreen = ({ navigation }) => {
  const popAction = StackActions.popToTop()

  useFocusEffect(
    useCallback(() => {
      // alert('Screen was focused')
      navigation.dispatch(popAction)

      return () => {
        // alert('Screen was unfocused')
        // // Useful for cleanup functions
      }
    }, []),
  )

  return (
    <>
      <CustomHeader />
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(mainNavigationRoutes.profileScreen)
          }
          style={styles.cardContainer}>
          {/* Icon */}
          {icon.man(COLORS.lightScheme.primary, 45)}

          {/* label */}
          <Text style={styles.label}> Profile </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(mainNavigationRoutes.changePinScreen)
          }
          style={styles.cardContainer}>
          {/* Icon */}
          {icon.password(COLORS.lightScheme.primary, 45)}

          {/* label */}
          <Text style={styles.label}> Change Pin </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(mainNavigationRoutes.reportChooseScreen)
          }
          style={styles.cardContainer}>
          {/* Icon */}
          {icon.profile(COLORS.lightScheme.primary, 45)}

          {/* label */}
          <Text style={styles.label}> Reports </Text>
        </TouchableOpacity>

        {printingSDKType.escpos && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(mainNavigationRoutes.printerConnectScreen)
            }
            style={styles.cardContainer}>
            {icon.printer(COLORS.lightScheme.primary, 45)}
            <Text style={styles.label}> Printer Connect </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(mainNavigationRoutes.duplicateReceipt)
          }
          style={styles.cardContainer}>
          {/* Icon */}
          {icon.duplicate(COLORS.lightScheme.primary, 45)}

          {/* label */}
          <Text style={styles.label}>Duplicate Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate(mainNavigationRoutes.aboutScreen)}
          style={styles.cardContainer}>
          {/* Icon */}
          {icon.info(COLORS.lightScheme.primary, 45)}

          {/* label */}
          <Text style={styles.label}>About</Text>
        </TouchableOpacity>

        <View
          style={{
            ...styles.cardContainer,
            backgroundColor: COLORS.lightScheme.surfaceVarient,
            elevation: 0,
          }}>
          {/* Blank Card */}
        </View>
      </View>
    </>
  )
}

export default SettingScreen

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    justifyContent: "space-evenly",
    backgroundColor: COLORS.lightScheme.surfaceVarient,
    height: "100%",
  },
  cardContainer: {
    backgroundColor: COLORS.lightScheme.onPrimary,
    alignItems: "center",
    width: "45%",
    height: 150, //
    padding: 10,
    margin: 5,
    borderRadius: 10,
    justifyContent: "center",
    elevation: 10,
  },
  label: {
    textAlign: "center",
    color: COLORS.lightScheme.onSurface,
    padding: 10,
    fontSize: PixelRatio.roundToNearestPixel(18),
  },
})
