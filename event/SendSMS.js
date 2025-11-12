const axios = require('axios');
const dateFormat = require('dateformat');
const { db_Select } = require('../model/MasterModule');
const transactionSms = async (phone_no, amount, account_holder_name, total_deposit_amount, tnx_id, date, mode, account_number, bank_id, account_type = '') => {
    try {
        encodeURI(account_holder_name)
        encodeURI(date ? dateFormat(new Date(date), "dd/mm/yyyy HH:MM:ss") : new Date())
        encodeURI(mode)
        account_number = String(account_number).slice(-4)

        var to = phone_no;
        var text = 'deposited';

        let where = `bank_id=${bank_id}`
        let resData = await db_Select('*', "md_sms", where, null);
        console.log('*************',resData);
        // if (resData5.msg[0]) {
            const smstemp = resData.msg[0].template;
            const replacedUrl = smstemp.replace('${phone_no}', phone_no)
                .replace('${account_number}', account_number)
                .replace('${amount}', amount)
                .replace('${text}', text)
                .replace('${account_holder_name}', account_holder_name)
                .replace('${tnx_id}', tnx_id)
                .replace('${date}', date)
                .replace('${account_type}', account_type)
                .replace('${transaction_type}', 'Deposit')
                .replace('${total_deposit_amount}', total_deposit_amount);
        console.log(replacedUrl, 'SMS TEMPLATE TO BE SENT -------------------------');

            // var textData = `Your %20 A/C No: *****${account_number}%20 is%20 ${text} %20 by Rs.${amount}%20.Balance is Rs.${total_deposit_amount}%20.Thanks,The Bihar Co-Op Credit Soceity Ltd.`
            /*const url= `http://bulksms.sssplsales.in/api/api_http.php? username=TBCCSL&password=TB524CCSL&senderid=TBIHAR&to=${phone_no}&text=Your%20Savings%20Deposit%20A/C%20No:%20********1040%20is%20DEBITED%20by%20Rs.177800.Balance%20is%20Rs.76.Thanks,The%20Bihar%20Co-Op%20Credit%20Soceity%20Ltd.&route=Informative&type=text`*/

            // const url = `http://bulksms.sssplsales.in/api/api_http.php? username=TBCCSL&password=TB524CCSL&senderid=TBIHAR&to=${phone_no}&text=${textData}&route=Informative&type=text`
            const result = await axios.get(replacedUrl)
            return result
        // }else{
        //     return false;
        // }
        
    } catch (error) {
        return error
    }
}
module.exports = { transactionSms }