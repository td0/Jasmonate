const getList = require('./getList');
const dataManager = require('./dataManager');
const savedData = require('./data/saved_data.json');
const c = require('./colors');

var List={};
var ListRecognized={};
var ListNotRecognized=[];

const readList = () => {
    let macList = savedData.macaddr;
    let userList = savedData.users;
    for( x of List) {
        if(x.Active==1) {
            if(macList[x.MACAddress] != undefined){
                let name = macList[x.MACAddress];
                if(ListRecognized[name]==undefined) ListRecognized[name] = [];
                ListRecognized[name].push(userList[name][x.MACAddress].Alias);
            } else {
                if(ListNotRecognized==undefined) ListNotRecognized = [];
                let iFace = x.InterfaceType=='802.11'? 'wifi':x.InterfaceType;
                ListNotRecognized.push({
                    _oid: x._oid,
                    if: iFace,
                    ip: x.IPAddress,
                    mac: x.MACAddress,
                    src: x.AddressSource,
                    host: x.HostName
                });
            }
        }
    };
}

const stdout = str =>{
    process.stdout.write(str);
}

const printList = () => {
    stdout('\n'+c.FgBlue+ ' -<< Recognized >>- \n'+c.Reset);
    for(x in ListRecognized){
        stdout(c.Reset+c.FgYellow+ '> ');
        stdout(c.FgCyan+x+' \t '+c.Reset+': ');
        for(y of ListRecognized[x]){
            if(y == ListRecognized[x][ListRecognized[x].length-1]) stdout(y+'\n');
            else stdout(y+', ');
        }
        stdout(c.Reset);
    }
    if(ListNotRecognized.length>0) {
        stdout('\n'+c.FgRed+ ' -<< Not Recognized >>- \n'+c.Reset);
        for(x of ListNotRecognized){
            stdout(c.Reset+c.FgRed+ '> ');
            stdout(c.FgMagenta+x.host+c.Reset+'\n');
            stdout('\t-oid \t:'+x._oid+'\n');
            stdout('\t-iface \t:'+x.if+'\n');
            stdout('\t-IP \t:'+x.ip+'\n');
            stdout('\t-Mac \t:'+x.mac+'\n');
            stdout('\t-Src \t:'+x.src+'\n');
            stdout(c.Reset);
        }
    }
}

getList().then(resp => {
    List = resp;
    if(List != undefined){
        readList();
        printList();
    }
});