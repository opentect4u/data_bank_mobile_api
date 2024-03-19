import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    PixelRatio,
  } from "react-native"
  import React from "react"
  // import LinearGradient from 'react-native-linear-gradient';
  import { COLORS, colors } from "../Resources/colors"
  
  const CancelButtonComponent = ({
    title,
    disabled = false,
    handleOnpress,
    customStyle,
  }) => {
    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={handleOnpress}
        style={[
          {
            backgroundColor: disabled
              ? COLORS.darkScheme.secondary
              : COLORS.lightScheme.primary,
              borderColor:COLORS.lightScheme.primary,
              borderWidth:1.5
          },
          { ...styles.container, ...customStyle },
        ]}>
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    )
  }
  
  export default CancelButtonComponent
  
  const styles = StyleSheet.create({
    container: {
      borderRadius: PixelRatio.roundToNearestPixel(30),
      padding: 10,
      borderColor:COLORS.lightScheme.primary,
      border:1.5,
      elevation: 5,
      // backgroundColor: colors.secondary
    },
    text: {
      color: COLORS.lightScheme.primary,
      fontSize: PixelRatio.roundToNearestPixel(18),
      fontWeight: "700",
      textAlign: "center",
      letterSpacing: 1,
    },
  })
  