import { Dimensions, StyleSheet, View, Text } from "react-native"
import React from "react"
import LottieView from "lottie-react-native"
import anim from "../animations/no_internet_2.json"
import { COLORS } from "../Resources/colors"

var SCREEN_HEIGHT = Dimensions.get("screen").height
var SCREEN_WIDTH = Dimensions.get("screen").width

const NoInternetScreen = () => {
  return (
    <View
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "#ffffff",
      }}>
      <View
        style={{
          padding: 20,
          borderWidth: 1,
          marginTop: 20,
        }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.lightScheme.error,
          }}>
          No Internet Available
        </Text>
      </View>
      <LottieView
        source={anim}
        autoPlay
        loop
        resizeMode="cover"
        style={{
          width: 300,
          height: 300,
          position: "absolute",
          top: SCREEN_HEIGHT / 2.5,
        }}
      />
    </View>
  )
}

export default NoInternetScreen

const styles = StyleSheet.create({})
