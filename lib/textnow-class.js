const { CookieJar } = require("tough-cookie");
const { TNMessaging } = require("./messages");
const makeFetch = require("./fetch-maker");
class TextNow {
    constructor() {
        // does nothing as it needs to be init()ed with auth
    }
    /**
     * @async
     * @function refreshUser
     * @description Refreshes this.user
     * @returns {Object} this.user
     */
    async refreshUser() {
        this.user = await (await this.fetch(`https://www.textnow.com/api/users/${this.user.username}`)).json();
        this.user.session = (await (await this.fetch(`https://www.textnow.com/api/${this.user.username}/session`)).json()).id;
        return this.user;
    }
    /**
     * @private
     * @async
     * @function _init
     * @description Initialize TN object with cookie jar
     * @param {CookieJar} jar CookieJar to use for authentication
     * @param {String} username Username of authenticated user
     * @returns {Promise<TextNow>} TextNow object
     */
    async _init(jar, username) {
        /**
         * @type {CookieJar}
         */
        this.jar = jar;
        this.fetch = makeFetch(jar);
        /**
         * @type {Object}
         */
        this.user = {
            username
        };
        await this.refreshUser();
        this.messaging = await (new TNMessaging())._init(jar, username, this.user.session);
        return this;
    }
}
module.exports = { TextNow };