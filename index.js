const fs = require('fs').promises;
const os = require('os');
const cloudflare = require('cloudflare');
const axios = require('axios').default;
require('dotenv').config();

const records = cloudflare({
    token: process.env["TOKEN"]
}).dnsRecords;

const log = (msg, file = "./error.log") => {
    const now = new Date().toUTCString();
    fs.appendFile(file, `${now}: ${msg}${os.EOL}`);
};

const cfSuccessHandler = (res) => {
    if (!res.success)
        throw Error(JSON.stringify(res.errors));
    return res.result;
};

const regexIPv4 = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/;

const checkAndUpdateRecord = async (recordName) => {
    const rec = await records.browse(
        process.env["ZONE"]
    ).then(cfSuccessHandler)
    .then(list =>
        list.find(r => r.type === "A" && r.name.startsWith(recordName))
    ).catch(log);

    const ip = await axios.get("https://api.ipify.org/")
        .then(res => res.data.trim())
        .catch(error => log(
            error.response
                ? `${error.response.status} - ${error.response.statusText}: ${JSON.stringify(error.response.data)}`
                : error.message ?? JSON.stringify(error.config)
        ));

    if (!ip?.match(regexIPv4) || !rec?.content || ip === rec.content)
        return;

    records.edit(
        process.env["ZONE"],
        rec.id,
        {
            name: recordName,
            type: "A",
            content: ip,
            ttl: rec.ttl,
            proxied: rec.proxied
        }
    ).then(cfSuccessHandler)
    .then(r =>
        console.log(`DDNS IP changed: ${recordName} - ${r.content}`)
        || log(`${recordName} - ${r.content}`, "./ips.log")
    ).catch(log);
};

const recordNameList = process.env["RECORDS"]?.split(",");
recordNameList.forEach(checkAndUpdateRecord);
