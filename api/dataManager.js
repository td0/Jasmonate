const fs = require('fs');
var savedData = require(__dirname+'/../data/saved_data.json');

const writeData = (successString) => {
    let dataString = JSON.stringify(savedData, null, 4);
    fs.writeFile(__dirname+'/../data/saved_data.json', dataString, err => {
        if (err) console.error(err);
        else {
            if (successString == undefined) successString = 'File successfully written!';
            console.log(successString);
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
            writeData('Data added!');
        } else console.error('Data is already exists');
    },
    remove: (mac) => {
        if (mac != undefined){
            let nameTemp = savedData.macaddr[mac];
            if (nameTemp!=undefined){
                delete savedData.users[nameTemp][mac];
                delete savedData.macaddr[mac];
                let isEmpty = Object.keys(savedData.users.test).length == 0;
                if (isEmpty) delete savedData.users[nameTemp];
                writeData('Data removed!');

            } else console.error('Data is not available!');
        } else console.error('You have to pass any saved physical address');
    },
    test: () => {
        console.log(savedData.macaddr['dash28']);
    }
}

module.exports = dataManager;