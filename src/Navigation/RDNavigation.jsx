import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import mainNavigationRoutes from "../Routes/NavigationRoutes"
import FindAccountScreen from "../Screens/FindAccountScreen/FindAccountScreen"
import FindLoanAccountScreen from "../Screens/FindAccountScreen/FindLoanAccountScreen"
import FindRDAccount from "../Screens/FindAccountScreen/FindRDAccount"
import AccountDetails from "../Screens/FindAccountScreen/AccountDetails"
import RDAccountPreview from "../Screens/FindAccountScreen/RDAccountPreview"
import RDAccountDetails from "../Screens/FindAccountScreen/RDAccountDetails"
const Stack = createNativeStackNavigator()
export default function RDNavigation() {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name={mainNavigationRoutes.findRDAccount}
          component={FindRDAccount}
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
          name={mainNavigationRoutes.RDAccountPreview}
          component={RDAccountPreview}
        />
        <Stack.Screen
          name={mainNavigationRoutes.RDAccountDetails}
          component={RDAccountDetails}
        />
      </Stack.Navigator>
    </>
  )
}

const styles = StyleSheet.create({})
