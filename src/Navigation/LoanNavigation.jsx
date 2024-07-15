import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import mainNavigationRoutes from "../Routes/NavigationRoutes"
import FindAccountScreen from "../Screens/FindAccountScreen/FindAccountScreen"
import FindLoanAccountScreen from "../Screens/FindAccountScreen/FindLoanAccountScreen"
import FindRDAccount from "../Screens/FindAccountScreen/FindRDAccount"
import AccountDetails from "../Screens/FindAccountScreen/AccountDetails"

import LoanAccountDetailsScreen from "../Screens/FindAccountScreen/LoanAccountDetailsScreen"
import LoanAccountPreviewScreen from "../Screens/FindAccountScreen/LoanAccountPreviewScreen"
const Stack = createNativeStackNavigator()
export default function LoanNavigation() {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name={mainNavigationRoutes.findLoanAccount}
          component={FindLoanAccountScreen}
        />
        {/* <Stack.Screen
          name={mainNavigationRoutes.findLoanAccount}
          component={FindLoanAccountScreen}
        />
        <Stack.Screen
          name={mainNavigationRoutes.findRDAccount}
          component={FindRDAccount}
        /> */}
        <Stack.Screen
          name={mainNavigationRoutes.loanAccountPreview}
          component={LoanAccountPreviewScreen}
        />
        <Stack.Screen
          name={mainNavigationRoutes.loanAccountDetails}
          component={LoanAccountDetailsScreen}
        />
      </Stack.Navigator>
    </>
  )
}

const styles = StyleSheet.create({})
