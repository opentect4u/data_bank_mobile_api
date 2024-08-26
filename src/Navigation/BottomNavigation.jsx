import { StyleSheet, Image, View } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { icon } from "../Resources/Icons"
import { COLORS, colors } from "../Resources/colors"
import SettingsNavigation from "./SettingsNavigation"
import EndWorkScreen from "../Screens/EndWorkScreen/EndWorkScreen"
import HomeNavigation from "./HomeNavigation"

const Tab = createBottomTabNavigator()

const BottomNavigation = () => {
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: COLORS.lightScheme.onPrimary,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          tabBarActiveTintColor: COLORS.lightScheme.primary,
          tabBarInactiveTintColor: COLORS.lightScheme.onSurface,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
        }}>
        <Tab.Screen
          name={"Home_Navigator"}
          options={{
            tabBarIcon: ({ color, size }) => icon.HomeFill(color, 30),
            headerShown: false,
          }}
          component={HomeNavigation}
        />

        <Tab.Screen
          name={"EndWorkScreen"}
          options={{
            tabBarIcon: ({ color, size }) => icon.end(color, 30),
            headerShown: false,
          }}
          component={EndWorkScreen}
        />

        <Tab.Screen
          name="SettingScreens"
          component={SettingsNavigation}
          options={{
            tabBarIcon: ({ color, size }) => icon.settings(color, 30),
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </>
  )
}

export default BottomNavigation

const styles = StyleSheet.create({
  image: {
    borderRadius: 50,
  },
})
