const fs = require('fs');
var savedData = require(__dirname+'/../data/saved_data.json');

const writeData = (successString) => {
    let dataString = JSON.stringify(savedData, null, 4);
    fs.writeFile(__dirname+'/../data/saved_data.json', dataString, err => {
        if (err) console.error(err);
        else {
            if (successString == undefined) successString = 'File successfully written!';
            // console.log(successString);
        }
    });
};

const dataManager = {
    add: (data) => {
        if (savedData.macaddr[data.mac] == undefined) {
            savedData.macaddr[data.mac] = data.name;
            if (savedData.users[data.name] == undefined) savedData.users[data.name] = {};
            if (data.iface.toLowerCase() == 'wifi') data.iface = '802.11';
            savedData.users[data.name][data.mac] = {
                "InterfaceType" : data.iface,
                "Alias" : data.alias
            };
            sortObjectbyValue();
            writeData('Data added!');
        }
        // else console.error('Data is already exists');
    },
    remove: (mac) => {
        if (mac != undefined){
            let nameTemp = savedData.macaddr[mac];
            if (nameTemp != undefined){
                delete savedData.users[nameTemp][mac];
                delete savedData.macaddr[mac];
                let isEmpty = Object.keys(savedData.users[nameTemp]).length == 0;
                if (isEmpty) delete savedData.users[nameTemp];
                writeData('Data removed!');

            }
            // else console.error('Data is not available!');
        }
        // else console.error('You have to pass any saved physical address');
    },
    sort: () => {
        let list = savedData.macaddr;
        let sortedArray = sortProperties(list);
        for(x of sortedArray){
            delete savedData.macaddr[x[0]];
            savedData.macaddr[x[0]] = x[1];
        }
    },
    test: () => {
        console.log(savedData.macaddr['dash28']);
    }
}

const sortObjectbyValue = () => {
    const list = savedData.macaddr;
    const sortedArray = sortProperties(list);
    for(x of sortedArray){
        delete savedData.macaddr[x[0]];
        savedData.macaddr[x[0]] = x[1];
    }
}

const sortProperties = (obj) => {
    let sortable=[];
    for(let key in obj)
        if(obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]);
    sortable.sort((a, b) => {
        let x=a[1].toLowerCase(),
            y=b[1].toLowerCase();
        return x<y ? -1 : x>y ? 1 : 0;
    });
    return sortable;
}

module.exports = dataManager;