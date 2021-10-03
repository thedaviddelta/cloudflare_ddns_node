# ![](https://www.cloudflare.com/favicon-32x32.png) Cloudflare DDNS Node

![Version](https://img.shields.io/github/package-json/v/TheDavidDelta/cloudflare_ddns_node)
[![License](https://img.shields.io/github/license/TheDavidDelta/cloudflare_ddns_node)](./LICENSE)

Dynamically update DNS record on IP change using Cloudflare API


## Installation & Usage

Before starting, you'll need [NodeJS](https://nodejs.org/) in order to run this program  
I recommend using the LTS version but it shouldn't matter

Firstly, clone this repository
```
git clone https://github.com/TheDavidDelta/cloudflare_ddns_node
```

Then install the project's dependencies detailed in the `package.json` file by running
```
npm i
```

Now create a `.env` file with the following fields
```
TOKEN=your cloudflare token
ZONE=the zone where the record is
RECORDS=comma separated list of record names
```
You can generate a Cloudflare Token [here](https://dash.cloudflare.com/profile/api-tokens)

Lastly, just schedule its execution with any kind of software   
For example, you may like to use Linux's `crontab` or Windows' *Task Scheduler*  
Here's an example for running the program every 6 hours using Linux's `crontab`
```
0 */6 * * * cd /path/to/the/folder/cloudflare_ddns_node && npm start
```
Make sure to configure folder's and `crontab`'s user permissions correctly


## License

Copyright © 2020 [TheDavidDelta](https://github.com/TheDavidDelta)  
This project is [GNU GPLv3](./LICENSE) licensed
