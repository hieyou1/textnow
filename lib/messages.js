const makeFetch = require("./fetch-maker");
const tough = require("tough-cookie");
const { CookieJar } = tough;
const FormData = require("form-data");
const { EventEmitter } = require("events");
const Sock = require("sockjs-client");
const { toTNFormat } = require("./phone-convert");
const { parsePhoneNumber } = require("libphonenumber-js");
class Message {
    /**
     * @constructor
     * @class Message
     * @param {Object} json Message JSON from TextNow
     * @returns {Message}
     */
    constructor(json) {
        if (json.type !== "message") throw new Error("message isn't a message");
        /**
         * @type {Object}
         */
        this.raw = json;

        // Still must init to get any other vars
    }
    /**
     * @async
     * @function init 
     * @description Initalize message object, async to accommodate a possible media message download
     * @param {Function} fetch fetch function, authenticated with CookieJar to fetch a possible media message
     * @returns {Promise<Message>}
     */
    async init(fetch) {
        let { content: json } = this.raw;
        this.id = json.id;
        this.from = parsePhoneNumber(json.contact.contact_value);
        this.date = new Date(json.date);
        switch (json.message_type) {
            case 1: {
                // text
                this.type = "text";
                this.content = json.message;
                break;
            }
            case 2: {
                // media hosted by TN's media server
                this.type = "media";
                let media = new URL(json.message);
                if (media.origin !== "https://media.textnow.com") throw new Error(`Media origin ${media.origin} is new. Did TextNow change its media server? If so, open a PR or issue. If not, someone's trying to spoof TN's message_type.`);
                let res = await fetch(media.href);
                res = await res.buffer();
                this.content = res;
                break;
            }
            default: {
                // new msg type? if encountered, open a PR or issue
                break;
            }
        }
        return this;
    }
    /**
     * @function toString 
     * @description Returns contents of message, which is probably not what you want. So you really shouldn't use this in production.
     * @returns {String} Contents of message
     */
    toString() {
        return this.content.toString();
    }
}
class TNMessaging extends EventEmitter {
    constructor() {
        super({
            "captureRejections": true
        });
    }
    /**
     * @private
     * @param {CookieJar} auth Authorization CookieJar
     * @param {String} username Username
     * @param {String} sid Session ID
     * @returns {Promise<TNMessaging>}
     */
    async _init(auth, username, sid) {
        /**
         * @private
         */
        this.auth = auth;
        /**
         * @private
         */
        this._fetch = makeFetch(auth);
        /**
         * @private
         */
        this.username = username;
        /**
         * @private
         */
        this.sid = sid;
        this.sock = new Sock(`https://webpushproxy.textnow.me/ws`);
        await new Promise((resolve) => {
            this.sock.onopen = resolve;
        });
        this.sock.send(JSON.stringify({
            "session": this.sid
        }));
        this.sock.onmessage = async (e) => {
            try {
                let msg = JSON.parse(e.data);
                switch (msg.type) {
                    case "message": {
                        // I have no idea how to document an EventEmitter event in Nodejs for VSCode Intellisense. If someone does, please open a PR or issue.
                        /**
                         * see line above
                         * 
                         * event message
                         * param {Message} Instance of Message
                         */
                        this.emit("message", await (new Message(msg)).init(this._fetch));
                        break;
                    }
                    default: {
                        // new event, who dis?
                        break;
                    }
                }
            } catch (err) {
                // guess it's not for us?
            }
        };
        return this;
    }
    /**
     * @async
     * @function send
     * @description Send a message
     * @param {String} number Phone number, will be converted using libphonenumber-js
     * @param {String} message Message to send
     */
    async send(number, message) {
        let form = new FormData();
        form.append("json", JSON.stringify({
            "contact_value": toTNFormat(number),
            "contact_type": 2,
            message,
            "read": 1,
            "message_direction": 2,
            "message_type": 1,
            "from_name": "",
            "has_video": false,
            "new": true,
            "date": new Date().toISOString()
        }));
        (await (await this._fetch(`https://www.textnow.com/api/users/${this.username}/messages`, {
            "method": "post",
            "body": form
        })).json());
    }
    /**
     * @async
     * @function fromNumber
     * @description Get messages from number, does NOT emit message events
     * @param {PhoneNumber | String} number Phone number, will be converted using libphonenumber-js if it's a string
     * @returns {Promise<Array<Object>>} Array of messages
     */
    async fromNumber(number) {
        if (typeof number == "string") number = parsePhoneNumber(number);
        let msgs = (await (await this._fetch(`https://www.textnow.com/api/users/${this.username}/messages?contact_value=${toTNFormat(number)}&start_message_id=99999999999999&direction=past&page_size=30&get_archived=1`)).json()).messages;
        let ret = [];
        for (let i of msgs) {
            // these are not standard, so conversion is required first
            i.contact = {
                "contact_value": i.e164_contact_value
            };
            // make the Message instance
            ret.push(await (new Message({
                "type": "message",
                "content": i
            })).init(this._fetch));
        }
        return ret;
    }
}
module.exports = { TNMessaging, Message };