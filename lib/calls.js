// TODO: calls
const { EventEmitter } = require("events");
if (1 == 0) var { TextNow } = require("./textnow-class"); // to IntelliSense without causing an actual circular dependency, but this isn't the best way to do this. open a PR or issue if you can do it better
const { toTNFormat } = require("./phone-convert");
const { parsePhoneNumber } = require("libphonenumber-js");
const SIP = require("node-jssip");
const getMic = require("./get-mic");
// const { MediaStream } = require("wrtc");
const { appendFileSync } = require("fs");
class Call extends EventEmitter {

}
class TNCalling extends EventEmitter {
    /**
     * @class TNCalling
     * @constructor
     */
    constructor(tnInstance) {
        super({
            "captureRejections": true
        });
        /**
         * @private
         * @type {TextNow}
         */
        this._tnInstance = tnInstance;
    }
    /**
     * @async
     * @function init
     * @description Initialize TNCalling
     * @returns {Promise<TNCalling>}
     */
    async init() {
        this._testMic = await getMic();

        SIP.debug.enable("*");
        /**
         * @private
         * @type {Object}
         */
        this._sipConfig = this._tnInstance.user.sip;
        /**
         * @private
         * @type {SIP.WebSocketInterface}
         */
        this._wsInstance = new SIP.WebSocketInterface(`wss://web1.${this._sipConfig.host}`);
        /**
         * @private
         * @type {SIP.UA}
         */
        this._sipInstance = new SIP.UA({
            "authorization_user": this._sipConfig.username,
            "password": this._sipConfig.password,
            "sockets": [this._wsInstance],
            "uri": `sip:${this._sipConfig.username}@${this._sipConfig.host}`,
            "contact_uri": `sip:1${this._tnInstance.user.phone_number}@${this._sipConfig.host}`
        });
        this._sipInstance.on("newMessage", console.log);
        this._sipInstance.on("newRTCSession", async (msg) => {
            console.log("new session");
            switch (msg.originator) {
                case "local": {
                    // we placed the call and now have the audio stream for it
                    break;
                }
                case "remote": {
                    console.log("session is remote, answering");
                    // someone is calling us
                    msg.session.on("peerconnection", (e) => {
                        console.log(e);
                    });
                    msg.session.answer({
                        "mediaStream": this._testMic
                    });
                    msg.session.on("connecting", console.log);
                    // msg.session.connection.onconnectionstatechange = console.log.bind(console);
                    // console.log(msg.session.connection);
                    break;
                }
                default: {
                    // ???
                    break;
                }
            }
        });
        this._sipInstance.on("sipEvent", console.log);
        this._sipInstance.start();
        return this;
    }
}
module.exports = { TNCalling, Call };