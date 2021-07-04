## Classes

<dl>
<dt><a href="#Message">Message</a></dt>
<dd><p>Message</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#useCookieJar">useCookieJar(jar, username)</a> ⇒ <code>Promise.&lt;TextNow&gt;</code></dt>
<dd><p>Use a cookie jar to login</p>
</dd>
<dt><a href="#usePuppeteer">usePuppeteer()</a> ⇒ <code>Promise.&lt;TextNow&gt;</code></dt>
<dd><p>Use a Puppeteer window to login [will be full/non-headless to allow user to login]</p>
</dd>
<dt><a href="#init">init(fetch)</a> ⇒ <code><a href="#Message">Promise.&lt;Message&gt;</a></code></dt>
<dd><p>Initalize message object, async to accommodate a possible media message download</p>
</dd>
<dt><a href="#toString">toString()</a> ⇒ <code>String</code></dt>
<dd><p>Returns contents of message, which is probably not what you want. So you really shouldn&#39;t use this in production.</p>
</dd>
<dt><a href="#send">send(number, message)</a></dt>
<dd><p>Send a message</p>
</dd>
<dt><a href="#fromNumber">fromNumber(number)</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Get messages from number, does NOT emit message events</p>
</dd>
<dt><a href="#toTNFormat">toTNFormat(number)</a> ⇒ <code>String</code></dt>
<dd></dd>
<dt><a href="#fromTNFormat">fromTNFormat(tnNumber)</a> ⇒ <code>PhoneNumber</code></dt>
<dd></dd>
<dt><a href="#refreshUser">refreshUser()</a> ⇒ <code>Object</code></dt>
<dd><p>Refreshes this.user</p>
</dd>
</dl>

<a name="Message"></a>

## Message
Message

**Kind**: global class  

* [Message](#Message)
    * [new Message(json)](#new_Message_new)
    * [.raw](#Message+raw) : <code>Object</code>

<a name="new_Message_new"></a>

### new Message(json)

| Param | Type | Description |
| --- | --- | --- |
| json | <code>Object</code> | Message JSON from TextNow |

<a name="Message+raw"></a>

### message.raw : <code>Object</code>
**Kind**: instance property of [<code>Message</code>](#Message)  
<a name="useCookieJar"></a>

## useCookieJar(jar, username) ⇒ <code>Promise.&lt;TextNow&gt;</code>
Use a cookie jar to login

**Kind**: global function  
**Returns**: <code>Promise.&lt;TextNow&gt;</code> - Authenticated and ready-to-go TextNow instance  

| Param | Type | Description |
| --- | --- | --- |
| jar | <code>CookieJar</code> | CookieJar to use |
| username | <code>String</code> | Username of authenticated user |

<a name="usePuppeteer"></a>

## usePuppeteer() ⇒ <code>Promise.&lt;TextNow&gt;</code>
Use a Puppeteer window to login [will be full/non-headless to allow user to login]

**Kind**: global function  
**Returns**: <code>Promise.&lt;TextNow&gt;</code> - Authenticated and ready-to-go TextNow instance  
<a name="init"></a>

## init(fetch) ⇒ [<code>Promise.&lt;Message&gt;</code>](#Message)
Initalize message object, async to accommodate a possible media message download

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| fetch | <code>function</code> | fetch function, authenticated with CookieJar to fetch a possible media message |

<a name="toString"></a>

## toString() ⇒ <code>String</code>
Returns contents of message, which is probably not what you want. So you really shouldn't use this in production.

**Kind**: global function  
**Returns**: <code>String</code> - Contents of message  
<a name="send"></a>

## send(number, message)
Send a message

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| number | <code>String</code> | Phone number, will be converted using libphonenumber-js |
| message | <code>String</code> | Message to send |

<a name="fromNumber"></a>

## fromNumber(number) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Get messages from number, does NOT emit message events

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Array of messages  

| Param | Type | Description |
| --- | --- | --- |
| number | <code>PhoneNumber</code> \| <code>String</code> | Phone number, will be converted using libphonenumber-js if it's a string |

<a name="toTNFormat"></a>

## toTNFormat(number) ⇒ <code>String</code>
**Kind**: global function  
**Returns**: <code>String</code> - Phone number in TextNow [E.164] format  

| Param | Type | Description |
| --- | --- | --- |
| number | <code>PhoneNumber</code> \| <code>String</code> | Number in any format recognized by libphonenumber-js, or an instance of PhoneNumber |

<a name="fromTNFormat"></a>

## fromTNFormat(tnNumber) ⇒ <code>PhoneNumber</code>
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| tnNumber | <code>String</code> | Number in TextNow format |

<a name="refreshUser"></a>

## refreshUser() ⇒ <code>Object</code>
Refreshes this.user

**Kind**: global function  
**Returns**: <code>Object</code> - this.user  
