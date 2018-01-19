const getMAList = require('./getList');
const savedData = require('./data/saved_data.json');
const c = require('./colors.js');

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
    // console.log(ListRecognized);
    // console.log(ListNotRecognized);
}

const stdout = str =>{
    process.stdout.write(str);
}

const printList = () => {
    stdout(c.FgWhite+c.BgMagenta+ '<< Recognized >>\n' + c.Reset);
    for(x in ListRecognized){
        stdout(c.FgYellow+ '> ');
        stdout(c.FgCyan+x+' \t '+c.Reset+': ');
        for(y of ListRecognized[x]){
            if(y == ListRecognized[x][ListRecognized[x].length-1]) stdout(y+'\n');
            else stdout(y+', ');
        }
    }
}

getMAList.then(resp => {
    List = resp;
    readList();
    printList();
})

