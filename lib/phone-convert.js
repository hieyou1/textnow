const { parsePhoneNumber, PhoneNumber } = require("libphonenumber-js");
/**
 * @function toTNFormat
 * @param {PhoneNumber|String} number Number in any format recognized by libphonenumber-js, or an instance of PhoneNumber
 * @returns {String} Phone number in TextNow [E.164] format
 */
const toTNFormat = (number) => {
    if (typeof number == "string") number = parsePhoneNumber(number, "US");
    return number.format("E.164");
};
/**
 * @function fromTNFormat
 * @param {String} tnNumber Number in TextNow format
 * @returns {PhoneNumber}
 */
const fromTNFormat = (tnNumber) => {
    return parsePhoneNumber(tnNumber);
};

module.exports = { toTNFormat, fromTNFormat };