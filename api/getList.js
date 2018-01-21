const request = require('request');
const rp = require('request-promise');
const key = require(__dirname+'/../data/keystore.json');

const url = 'http://'+key.host+'/';
var result;
var retry = 2;
var cookie = '';

var options = {
  method: 'GET',
  url: url+'lan_status.cgi?wlan',
  headers: {
    'Host': key.host,
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'DNT': '1',
    'Referer': url,
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cookie': cookie
  }
};

const parseList = body => {
    const fbound = body.indexOf('var device_cfg=')+17;
    const lbound = body.indexOf('];') - fbound;
    result = JSON.parse(JSON.stringify(eval('['+body.substr(fbound, lbound)+']'), null, 2));
    return new Promise((resolve, reject) => {
        resolve(result);
    });
}

module.exports = () =>
    rp.post(url+'login.cgi',{
        simple: false,
        resolveWithFullResponse: true
    }).form({
        name: key.username, pswd: key.pswd
    }).then( resp => {
        if (resp.statusCode == 302) {
            const tmpCookie = resp.headers['set-cookie'];
            let tmp1 = tmpCookie[0];
            let tmp2 = tmpCookie[1];
            tmp1 = tmp1.substr(0,tmp1.indexOf(';'))+'; ';
            tmp2 = tmp2.substr(0,tmp1.indexOf(';'))+';';
            cookie = 'lang=eng; '+tmp1+tmp2;
            options.headers['Cookie'] = cookie;
            return rp(options);
        } else return Promise.reject('username/password might not be correct!');
    }).then(parseList).catch( err => {
        console.error(err);
    });


