(async () => {
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
    }

    const cfSuccessHandler = res => {
        if (!res.success)
            throw Error(JSON.stringify(res.errors));
        return res.result;
    }

    const rec = await records.browse(
        process.env["ZONE"]
    ).then(cfSuccessHandler)
    .then(list => 
        list.find(r => r.type === "A" && r.name.startsWith(process.env["RECORD"]))
    ).catch(log);
    
    const ip = await axios.get("https://api.ipify.org/")
        .then(res => res.data.trim())
        .catch(error => log(
            error.response
                ? `${error.response.status} - ${error.response.status}: ${JSON.stringify(error.response.data)}`
                : error.message ?? JSON.stringify(error.config)
        ));
    
    const regexIPv4 = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/;
    
    if (!ip?.match(regexIPv4) || !rec?.content || ip === rec.content)
        return;
    
    records.edit(
        process.env["ZONE"], 
        rec.id, 
        {
            name: process.env["RECORD"],
            type: "A",
            content: ip,
            ttl: rec.ttl,
            proxied: rec.proxied
        }
    ).then(cfSuccessHandler)
    .then(r => 
        console.log(`DDNS IP changed: ${r.content}`)
        || log(r.content, "./ips.log")
    ).catch(log);
})();
