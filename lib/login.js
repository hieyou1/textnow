const Express = require("express");
const prompts = require("prompts");
const puppeteer = require("puppeteer-core");
const open = require("open");
const {
    chrome: killChrome,
    firefox: killFirefox
} = require("browser-kill");
const tough = require("tough-cookie");
const { Cookie, CookieJar, MemoryCookieStore } = tough;
const { TextNow } = require("./textnow-class");
/**
 * @async
 * @function useCookieJar
 * @description Use a cookie jar to login
 * @param {CookieJar} jar CookieJar to use
 * @param {String} username Username of authenticated user
 * @returns {Promise<TextNow>} Authenticated and ready-to-go TextNow instance
 */
const useCookieJar = async (jar, username) => {
    return await (new TextNow())._init(jar, username);
};
/**
 * @private
 */
const getBrowserInstance = async () => {
    const { browser: browserType } = await prompts({
        "type": "select",
        "name": "browser",
        "choices": [
            {
                "title": "Chrome",
                "description": "Connect to a Chrome instance",
                "value": "chrome",
                "selected": true
            },
            {
                "title": "Firefox",
                "description": "Connect to a Firefox instance",
                "value": "firefox",
                "selected": false
            }
        ],
        "message": "To log into TextNow, please select your browser"
    });
    try {
        if (browserType == "chrome") {
            await killChrome();
        } else {
            await killFirefox();
        }
    } catch (err) {
        // they ain't runnin'
    }
    // detect when the browser starts running, the quick and dirty way
    let waitForPortResolver;
    let waitForPort = new Promise((resolve) => {
        waitForPortResolver = resolve;
    });
    let waitForBrowser = new Promise(async (resolve) => {
        let app = Express();
        let listener;
        app.get("/", (req, res) => {
            resolve();
            res.status(200).type("text").send("Waiting for tab to open...");
            listener.close();
        });
        listener = await new Promise((resolve) => {
            let listener = app.listen(0, () => {
                waitForPortResolver(listener.address().port);
                resolve(listener);
            });
        });
    });
    let port = await waitForPort;
    await open(`http://localhost:${port}`, {
        "app": {
            "name": ((browserType == "chrome") ? open.apps.chrome : open.apps.firefox),
            "arguments": ["--remote-debugging-port=9222"]
        },
        "newInstance": true
    });
    console.log(`Not working? Navigate to http://localhost:${port} in the ${browserType} window that just opened.`)
    await waitForBrowser;
    return await puppeteer.connect({
        "product": browserType,
        "browserURL": "http://localhost:9222"
    });
};
/**
 * @async
 * @function usePuppeteer
 * @description Use a Puppeteer window to login [will be full/non-headless to allow user to login]
 * @returns {Promise<TextNow>} Authenticated and ready-to-go TextNow instance
 */
const usePuppeteer = () => {
    return new Promise(async (resolve) => {
        const browser = await getBrowserInstance();
        browser.isClosed = false;
        const page = await browser.newPage();
        await page.bringToFront();
        await page.goto("https://textnow.com/login");
        page.on("request", async (e) => {
            if (e.url().indexOf("https://www.textnow.com/api/users/") == 0 && e.method().toLowerCase() == "get" && !browser.isClosed) {
                browser.isClosed = true; // originally it was going to set to true when the browser closed, but now it isn't to prevent multiple runs of the same function in case we don't resolve in time
                const jar = new CookieJar(new MemoryCookieStore(), {
                    "looseMode": true,
                    "allowSpecialUseDomain": true
                });
                const url = page.url();
                // console.log(await page.cookies(), url, e.url());
                for (let i of await page.cookies()) {
                    let { value, domain, name: key, path, expires, httpOnly, secure } = i;
                    expires = new Date(expires * 1000 /* pagecookie.expires is the Unix time in seconds, not ms */);
                    // if (domain.indexOf(".") == 0) domain = domain.replace(".", ""); // MemoryCookieStore gets confused otherwise
                    await jar.setCookie(new Cookie({
                        key,
                        value,
                        expires,
                        domain,
                        path,
                        secure,
                        httpOnly,
                    }), url);
                }
                resolve(await useCookieJar(jar, e.url().replace(`https://www.textnow.com/api/users/`, "").split("/")[0]));
                await browser.close();
            }
        });
    });
};
module.exports = { useCookieJar, usePuppeteer };