import { REACT_APP_BASE_URL } from "../Config/config"

export const address = {
  LOGIN: `${REACT_APP_BASE_URL}/user/login`,
  NOW_DATE: `${REACT_APP_BASE_URL}/user/now_date`,
  MY_AGENT: `${REACT_APP_BASE_URL}/user/my_agent`,
  COLLECTION_CHECKED: `${REACT_APP_BASE_URL}/user/collection_checked`,
  TOTAL_COLLECTION: `${REACT_APP_BASE_URL}/user/total_collection`,
  END_COLLECTION: `${REACT_APP_BASE_URL}/user/end_collection`,
  SEARCH_ACCOUNT: `${REACT_APP_BASE_URL}/user/search_account`,
  LAST_TNX_DATE: `${REACT_APP_BASE_URL}/user/get_acc_prev_col`,
  TRANSACTION: `${REACT_APP_BASE_URL}/user/transaction`,
  CHANGE_PIN: `${REACT_APP_BASE_URL}/user/change_pin`,
  DAY_SCROLL_REPORT: `${REACT_APP_BASE_URL}/user/day_scroll_report`,
  TYPE_WISE_REPORT: `${REACT_APP_BASE_URL}/user/type_wise_report`,
  NO_WISE_REPORT: `${REACT_APP_BASE_URL}/user/type_wise_report_modified`,
  NON_COLLECTON_REPORT: `${REACT_APP_BASE_URL}/user/non_collection_report`,
  MINI_STATEMENT: `${REACT_APP_BASE_URL}/user/date_wise_mini_statement`,
  DUPLICATE_RECEIPT: `${REACT_APP_BASE_URL}/user/account_wise_scroll_report`,
  DATE_WISE_COLL_SUMMARY: `${REACT_APP_BASE_URL}/user/date_wise_summary`,
  GET_VERSION_DETAILS: `${REACT_APP_BASE_URL}/user/app_version`,
  LAST_FIVE_TRANSACTIONS: `${REACT_APP_BASE_URL}/user/last_five_transaction`,
  DAY_TOTAL_REPORT: `${REACT_APP_BASE_URL}/user/day_tot_report`,
}
