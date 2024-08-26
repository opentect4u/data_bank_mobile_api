import { StyleSheet } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import mainNavigationRoutes from "../Routes/NavigationRoutes"
import FindAccountScreen from "../Screens/FindAccountScreen/FindAccountScreen"
import AccountDetails from "../Screens/FindAccountScreen/AccountDetails"
import AccountPreview from "../Screens/FindAccountScreen/AccountPreview"
import FindRDAccount from "../Screens/FindAccountScreen/FindRDAccount"
import FindLoanAccountScreen from "../Screens/FindAccountScreen/FindLoanAccountScreen"
const Stack = createNativeStackNavigator()

const AccountFindNavigation = () => {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name={mainNavigationRoutes.findAccount}
          component={FindAccountScreen}
        />
        <Stack.Screen
          name={mainNavigationRoutes.findLoanAccount}
          component={FindLoanAccountScreen}
        />
        <Stack.Screen
          name={mainNavigationRoutes.findRDAccount}
          component={FindRDAccount}
        />
        <Stack.Screen
          name={mainNavigationRoutes.accountDetails}
          component={AccountDetails}
        />

        <Stack.Screen
          name={mainNavigationRoutes.accountPreview}
          component={AccountPreview}
        />
      </Stack.Navigator>
    </>
  )
}

export default AccountFindNavigation

const styles = StyleSheet.create({})
