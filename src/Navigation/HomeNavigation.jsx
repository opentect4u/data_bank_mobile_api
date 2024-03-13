import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Home from '../Screens/Home/Home'
import DailyNavigation from './DailyNavigation'
import LoanNavigation from './LoanNavigation'
import RDNavigation from './RDNavigation'
const Stack = createNativeStackNavigator()
export default function HomeNavigation() {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name={"Home"}
          component={Home}
        />
       
       

        <Stack.Screen
          name={"Daily_Navigation"}
          component={DailyNavigation}
        />
         <Stack.Screen
          name={"Loan_Navigation"}
          component={LoanNavigation}
        />
         <Stack.Screen
          name={"RD_Navigation"}
          component={RDNavigation}
        />




      </Stack.Navigator>
    </>
  )
}

const styles = StyleSheet.create({})