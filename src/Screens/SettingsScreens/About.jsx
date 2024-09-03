import { StyleSheet, View, Text } from "react-native"
import { COLORS } from "../../Resources/colors"
import CustomHeader from "../../Components/CustomHeader"
import { Table, Rows } from "react-native-table-component"

import DeviceInfo from "react-native-device-info"
import { useState } from "react"
const About = () => {
  const [update, setUpdate] = useState(() => false)

  let version = DeviceInfo.getVersion()
  return (
    <View style={{ backgroundColor: COLORS.lightScheme.background }}>
      <CustomHeader />

      <View style={styles.nameContainer}>
        <Text
          style={styles.containerText}>{`Current Version: ${version}`}</Text>
      </View>
      <View style={styles.posContainer}>
        <Text style={styles.containerText}>{`POS Version`}</Text>
      </View>

      {update && (
        <View style={styles.nameContainerUpdate}>
          <Text style={styles.containerText}>{`New Update: ${version}`}</Text>
        </View>
      )}

      {/* <View
        style={{
          backgroundColor: COLORS.lightScheme.background,
          height: "100%",
          padding: 20,
        }}>
        <Table style={{ backgroundColor: COLORS.lightScheme.onTertiary }}>
          <Rows data={tableData} textStyle={styles.text} />
        </Table>
      </View> */}
    </View>
  )
}

export default About

const styles = StyleSheet.create({
  nameContainer: {
    margin: 20,
    padding: 10,
    backgroundColor: "teal",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  posContainer: {
    margin: 20,
    padding: 10,
    backgroundColor: "grey",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  nameContainerUpdate: {
    margin: 20,
    padding: 10,
    backgroundColor: "orange",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  containerText: {
    fontSize: 25,
    color: COLORS.lightScheme.onPrimary,
  },
  text: {
    color: COLORS.lightScheme.onBackground,
    fontWeight: "600",
    borderBottomColor: COLORS.lightScheme.secondary,
    borderBottomWidth: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  logoContainer: {
    backgroundColor: COLORS.darkScheme.onBackground,
    borderBottomLeftRadius: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 150,
  },

  image: {
    height: 100,
    width: 100,
    backgroundColor: COLORS.lightScheme.onTertiaryContainer,
    borderRadius: 50,
    alignSelf: "center",
  },
})
