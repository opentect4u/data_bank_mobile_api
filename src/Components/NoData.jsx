import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function NoData() {
  return (
    <View style={styles.container}>
      <Text style={styles.noDataContainer}>No data found!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    noDataContainer:{

        color:'gray',
        fontSize:15
    }
})