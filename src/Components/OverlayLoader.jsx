import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native"
import React from "react"

const OverlayLoader = ({ text = "Loading..." }) => {
  return (
    <View style={styles.body}>
      <ActivityIndicator size={"large"} />
      <Text>{text}</Text>
    </View>
  )
}

export default OverlayLoader

const styles = StyleSheet.create({
  body: {
    height: Dimensions.get("screen").height,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
  },
})
