const ogfetch = require("node-fetch");
const tough = require("tough-cookie");
const { CookieJar } = tough;
const fetchMaker = require("fetch-cookie/node-fetch");
/**
 * @function makeFetch
 * @param {CookieJar} jar CookieJar to use
 * @returns {ogfetch}
 */
const makeFetch = (jar) => {
    return fetchMaker(ogfetch, jar);
};
module.exports = makeFetch;