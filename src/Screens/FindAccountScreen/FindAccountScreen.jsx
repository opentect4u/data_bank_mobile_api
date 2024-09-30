import {
  ActivityIndicator,
  AppState,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useCallback, useContext, useEffect, useState } from "react"
import CustomHeader from "../../Components/CustomHeader"
import { COLORS, colors } from "../../Resources/colors"
import InputComponent from "../../Components/InputComponent"
import SearchCard from "../../Components/SearchCard"
import axios from "axios"
import { REACT_APP_BASE_URL } from "../../Config/config"
import { address } from "../../Routes/addresses"
import { AppStore } from "../../Context/AppContext"
import { useFocusEffect, useRoute } from "@react-navigation/native"

const FindAccountScreen = ({ navigation }) => {
  const [searchValue, changeSearchValue] = useState(() => "")
  const [userBankDetails, setUserBankDetails] = useState(() => [])
  const [isLoading, setIsLoading] = useState(false)

  const { userId, bankId, branchCode } = useContext(AppStore)

  // const { type } = route.params
  const { params } = useRoute()

  function handleAccountSearch() {
    if (!searchValue) {
      return
    }
    fetchBankDetails()
  }

  const debounce = func => {
    let timer
    return function (...args) {
      // console.log(args)
      const context = this
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        func.apply(context, args)
      }, 2000)
    }
  }

  // useEffect(() => {
  //   handleAccountSearch()
  //   console.log(userBankDetails)
  // }, [searchValue])

  useEffect(() => {
    debounce(fetchBankDetails)()
  }, [searchValue])

  const fetchBankDetails = async () => {
    setIsLoading(true)
    const obj = {
      bank_id: bankId,
      branch_code: branchCode,
      agent_code: userId,
      account_number: searchValue,
      flag: params?.type,
    }
    console.log(bankId, branchCode, userId, searchValue)
    console.log(userBankDetails)

    console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHH", obj)

    await axios
      .post(address.SEARCH_ACCOUNT, obj, {
        headers: {
          Accept: "application/json",
        },
      })
      .then(res => {
        setIsLoading(false)

        console.log("bank details", res?.data?.success?.msg)
        setUserBankDetails(res?.data?.success?.msg)
      })
      .catch(err => {
        setIsLoading(false)

        setUserBankDetails([])
        console.log("error: " + err?.response?.data)
      })
  }

  useFocusEffect(
    useCallback(() => {
      // alert('Screen was focused')
      return () => {
        // alert('Screen was unfocused')
        // // Useful for cleanup functions
        changeSearchValue("")
        setUserBankDetails([])
      }
    }, []),
  )
  // console.log('isLoading '+isLoading)
  return (
    <View>
      <CustomHeader />
      <View style={styles.container}>
        {/* Account Cards */}
        <Text style={styles.title}>
          {params?.type === "D"
            ? "Daily"
            : params?.type === "L"
            ? "Loan"
            : "RD"}
        </Text>
        {/* {isLoading} */}
        {isLoading && (
          <ActivityIndicator
            color={COLORS.lightScheme.primary}
            style={styles.loading}
            size={"large"}
          />
        )}

        <ScrollView
          style={{ maxHeight: "60%" }}
          keyboardShouldPersistTaps="handled">
          {userBankDetails &&
            userBankDetails?.map((props, index) => {
              console.log("========================", props)
              return (
                <SearchCard
                  item={props}
                  index={index}
                  navigation={navigation}
                  key={index}
                  flag={params?.type}
                />
              )
            })}
        </ScrollView>
        {/* Search Component */}
        <View style={styles.searchContainer}>
          <InputComponent
            label={"Account No. / Name"}
            placeholder={"Enter Account No. / Name"}
            value={searchValue}
            handleChange={changeSearchValue}
            autoFocus={true}
          />
        </View>
      </View>
    </View>
  )
}

export default FindAccountScreen

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.lightScheme.background,
    height: "100%",
    padding: 10,
  },
  searchContainer: {
    position: "absolute",
    bottom: 130,
    width: "100%",
    alignSelf: "center",
    borderColor: COLORS.lightScheme.primary,
    borderWidth: 2,
    backgroundColor: COLORS.lightScheme.onPrimary,
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.lightScheme.tertiaryContainer,
    // alignSelf: 'center',
    letterSpacing: 4,
    backgroundColor: COLORS.lightScheme.primary,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  loading: {
    color: COLORS.lightScheme.tertiaryContainer,
    marginTop: 50,
  },
})
