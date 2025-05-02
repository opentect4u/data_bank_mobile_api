import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Home from "../Screens/Home/Home"
import FindAccountScreen from "../Screens/FindAccountScreen/FindAccountScreen"
import AccountDetails from "../Screens/FindAccountScreen/AccountDetails"
import AccountPreview from "../Screens/FindAccountScreen/AccountPreview"
import mainNavigationRoutes from "../Routes/NavigationRoutes"
import PrintTemplateScreen from "../Screens/PrintScreen/PrintTemplateScreen"

const Stack = createNativeStackNavigator()

export default function HomeNavigation() {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={"Home"} component={Home} />

        {/* <Stack.Screen name={"Daily_Navigation"} component={DailyNavigation} />
        <Stack.Screen name={"Loan_Navigation"} component={LoanNavigation} />
        <Stack.Screen name={"RD_Navigation"} component={RDNavigation} /> */}

        <Stack.Screen
          name={mainNavigationRoutes.findAccount}
          component={FindAccountScreen}
        />
        <Stack.Screen
          name={mainNavigationRoutes.accountDetails}
          component={AccountDetails}
        />
        <Stack.Screen
          name={mainNavigationRoutes.accountPreview}
          component={AccountPreview}
        />
        <Stack.Screen
          name={mainNavigationRoutes.printScreen}
          component={PrintTemplateScreen}
        />
      </Stack.Navigator>
    </>
  )
}

const styles = StyleSheet.create({})
