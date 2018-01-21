const blessed = require('blessed');
const getList = require('./api/getList');
const dataManager = require('./api/dataManager');
const savedData = require('./data/saved_data.json');
const c = require('./colors');

var addData = {};
var removeData = '';

/*
    BLESSED YOU!
*/
// main screen
const screen = blessed.screen({
    smartCSR: true,
    warning: true
});
screen.title = 'Jasmine Net Surveillance';
const mainBox = blessed.box({
    parent: screen,
    input: true,
    keys: true,
    vi: true,
    tags: true,
    top: 0,
    left: 0,
    width: '100%',
    style: {
        fg: 'white',
        border: {
            fg: '#f0f0f0'
        },
        scrollbar: {
            inverse: true
        }
    },
    scrollable: true,
    scrollbar: {
        ch: ' '
    }
});
const loadingBox = blessed.box({
    parent: mainBox,
    mouse: true,
    top: 'center',
    left: 'center',
    valign: 'middle',
    width: 35,
    height: 5,
    content: '{center}{bold}Loading List...{/bold}{/center}',
    tags: true,
    border: {type: 'line'},
    style: {
        fg: 'black',
        bg: 'yellow',
        border: { fg: 'yellow'}
    }
});
screen.append(mainBox);
// add data
const addDataForm = blessed.form({
    parent: mainBox,
    mouse: true,
    keys: true,
    vi: true,
    tags: true,
    align: 'left',
    content: ' {yellow-fg}{underline}Choose Host{/}',
    width: '100%',
    height: 9,
    valign: 'top',
    hidden: 'true',
    border: {type: 'line'},
    style: {
        fg: 'white'
    }
});
const macListForm = blessed.list({
    parent: addDataForm,
    mouse: true,
    keys: true,
    vi: true,
    width: 20,
    left: 1,
    top: 1,
    style: {
        bg: 'black',
        fg: 'white',
        selected : {
            bg: 'blue',
            fg: 'black'
        }
    }
});
const nameInputForm = blessed.textbox({
    parent: addDataForm,
    mouse: true,
    keys: true,
    hidden: true,
    style: {
        bg: 'cyan',
        fg: 'black'
    },
    height: 1,
    width: 20,
    left: 9,
    top: 4,
    name: 'nameText'
});
const aliasInputForm = blessed.textbox({
    parent: addDataForm,
    mouse: true,
    keys: true,
    hidden: true,
    style: {
        bg: 'blue',
        fg: 'white'
    },
    height: 1,
    width: 20,
    left: 9,
    top: 5,
    name: 'aliasText'
});
// remove data
const removeDataForm = blessed.box({
    parent: mainBox,
    mouse: true,
    keys: true,
    vi: true,
    tags: true,
    align: 'left',
    content: ' {yellow-fg}{underline}Choose Data to Delete{/}',
    width: '100%',
    height: 9,
    valign: 'top',
    hidden: 'true',
    border: {type: 'line'},
    style: {
        fg: 'white'
    }
})
const savedMacListForm = blessed.list({
    parent: removeDataForm,
    mouse: true,
    keys: true,
    vi: true,
    width: 40,
    tags: true,
    left: 1,
    top: 1,
    style: {
        bg: 'black',
        fg: 'white',
        selected : {
            bg: 'blue',
            fg: 'black'
        }
    }
});


screen.key(['C-q'], (ch, key) => {
    if (addDataForm.hidden && removeDataForm.hidden) return process.exit(0);
    else if (!addDataForm.hidden) {
        addDataForm.hide();
        nameInputForm.hide();
        aliasInputForm.hide();
        addDataForm.setContent(' {yellow-fg}{underline}Choose Host{/}');
        mainBox.focus();
        screen.render();
    } else if (!removeDataForm.hidden) {
        removeDataForm.hide();
        mainBox.focus();
        screen.render();
    }
});
screen.key('C-s', (ch, key) => {
    if (!addDataForm.hidden) {
        addDataForm.submit();
    } else if (!removeDataForm.hidden) {
        dataManager.remove(removeData);
        removeData = '';
        removeDataForm.setContent(' {yellow-fg}{underline}Choose Data to Delete{/}');
        removeDataForm.hide();
        savedMacListForm.show();
        fetch(printBlessedList);
    }
});
screen.key('r', (ch, key) => {
    if (loadingBox.hidden && addDataForm.hidden){
        if (!addDataForm.hidden) addDataForm.hide();
        mainBox.setContent('');
        loadingBox.show();
        screen.render();
        fetch(printBlessedList);
    }
});
// key to add data
screen.key('a', (ch, key) => {
    if (loadingBox.hidden && addDataForm.hidden &&
        removeDataForm.hidden && ListNotRecognized.length>0) {
        addDataForm.toggle();
        macListForm.show();
        macListForm.focus();
        screen.render();
    }
});
// key to remove data
screen.key('d', (ch, key) => {
    if (loadingBox.hidden && addDataForm.hidden &&
        removeDataForm.hidden && Object.keys(savedData.macaddr).length>0) {
        removeDataForm.toggle();
        savedMacListForm.show();
        savedMacListForm.focus();
        screen.render();
    }
})
// key to select list
screen.key('enter', (ch,key) => {
    if (!addDataForm.hidden) {
        addDataForm.focus();
        if (!macListForm.hidden) {
            macListForm.hide();
            nameInputForm.show();
            aliasInputForm.show();
        } else {
            macListForm.show();
            nameInputForm.hide();
            aliasInputForm.hide();
            addDataForm.setContent(' {yellow-fg}{underline}Choose Host{/}');
            macListForm.focus();
        }
        screen.render();
    } else if (!removeDataForm.hidden) {
        removeDataForm.focus();
        if (!savedMacListForm.hidden) {
            savedMacListForm.hide();
        } else {
            savedMacListForm.show();
            removeDataForm.setContent(' {yellow-fg}{underline}Choose Data to Delete{/}');
            savedMacListForm.focus();
        }
        screen.render();
    }
});

// add data event
macListForm.on('select', (item, select) => {
    let formContent = ' {yellow-fg}{underline}Choose Host{/}\n {magenta-fg}'+item.content;
    formContent += '{/}\n mac   : '+ListNotRecognized[select].mac;
    formContent += '\n iface : '+ListNotRecognized[select].if;
    formContent += '\n name  : ';
    formContent += '\n alias : ';
    addData.iface = ListNotRecognized[select].if;
    addData.mac = ListNotRecognized[select].mac;
    addDataForm.setContent(formContent);
    screen.render();
});
nameInputForm.on('focus', () => {
  nameInputForm.readInput();
});
aliasInputForm.on('focus', () => {
  aliasInputForm.readInput();
});
addDataForm.on('submit', (data) => {
    addData.name = data.nameText.toLowerCase();
    addData.alias = data.aliasText;
    dataManager.add(addData);
    addData = {};
    macListForm.show();
    nameInputForm.setValue('');
    nameInputForm.hide();
    aliasInputForm.setValue('');
    aliasInputForm.hide();
    addDataForm.setContent(' {yellow-fg}{underline}Choose Host{/}');
    addDataForm.hide();
    fetch(printBlessedList);
});
// remove data event
savedMacListForm.on('select', (item, select) => {
    let formContent = ' {red-fg}{underline}Delete this data?{/}\n {magenta-fg}'+item.content;
    formContent += '\n {yellow-fg}'+Object.keys(savedData.macaddr)[select]+'{/}';
    removeData = Object.keys(savedData.macaddr)[select];
    removeDataForm.setContent(formContent);
    screen.render();
});

mainBox.on('wheeldown', () => {
    if (addDataForm.hidden && loadingBox.hidden) {
        mainBox.scroll(1,true);
        screen.render();
    }
});
mainBox.on('wheelup', () => {
    if (addDataForm.hidden && loadingBox.hidden) {
        mainBox.scroll(-1,true);
        screen.render();
    }
});



var List = {};
var ListRecognized = {};
var ListNotRecognized = [];
const readList = () => {
    let macList = savedData.macaddr;
    let userList = savedData.users;
    for (x of List) {
        if (x.Active == 1) {
            if (macList[x.MACAddress] != undefined) {
                let name = macList[x.MACAddress];
                if (ListRecognized[name] == undefined) ListRecognized[name] = [];
                ListRecognized[name].push({
                    alias: userList[name][x.MACAddress].Alias,
                    ip: x.IPAddress,
                    mac: x.MACAddress
                });
            } else {
                if (ListNotRecognized == undefined) ListNotRecognized = [];
                let iFace = x.InterfaceType == '802.11' ? 'wifi' : x.InterfaceType;
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
    savedMacListForm.clearItems();
    for (x in macList){
        savedMacListForm.pushItem('{cyan-fg}'+ macList[x] + '{/} : '
            +userList[macList[x]][x].Alias);
    }
};
const stdout = str => {process.stdout.write(str)};
const printList = () => {
    stdout('\n' + c.FgBlue + ' -<< Recognized >>- \n' + c.Reset);
    for (x in ListRecognized) {
        stdout(c.Reset + c.FgYellow + '> ');
        stdout(c.FgCyan + x + c.Reset + '\n');
        for (y of ListRecognized[x]) {
            if (y == ListRecognized[x][ListRecognized[x].length - 1]) stdout('   -' + y.ip + ' \t : ' + y.alias + '\n');
            else stdout('   -' + y.ip + ' \t : ' + y.alias + '\n');
        }
        stdout(c.Reset);
    }
    if (ListNotRecognized.length > 0) {
        stdout('\n' + c.FgRed + ' -<< Not Recognized >>- \n' + c.Reset);
        for (x of ListNotRecognized) {
            stdout(c.Reset + c.FgRed + '> ');
            stdout(c.FgMagenta + x.host + c.Reset + '\n');
            stdout('\t-oid \t:' + x._oid + '\n');
            stdout('\t-iface \t:' + x.if+'\n');
            stdout('\t-IP \t:' + x.ip + '\n');
            stdout('\t-Mac \t:' + x.mac + '\n');
            stdout('\t-Src \t:' + x.src + '\n');
            stdout(c.Reset);
        }
    }
};
const printBlessedList = () => {
    let bContent = ' {blue-bg}{white-fg}{bold}-<< Recognized >>-{/}\n';
    for (x in ListRecognized) {
        bContent += '{yellow-fg}{bold}>{/} {cyan-fg}{bold}'+ x +'{/}\n';
        for (y of ListRecognized[x]) {
            let space = ' ';
            if (y.ip.length == 11) space += '  ';
            else if (y.ip.length == 12) space += ' ';
            bContent+='   -' + y.ip +space+': ' + y.alias + '\n';
        }
    }
    if (ListNotRecognized.length > 0) {
        bContent += '\n {red-bg}{white-fg}{bold}-<< Not Recognized >>-{/}\n';
        macListForm.clearItems();
        for (x of ListNotRecognized) {
            macListForm.pushItem(x.host);
            bContent += `{red-fg}>{/} {magenta-fg}${x.host}{/}\n`;
            bContent += `   -oid   : ${x._oid}\n`;
            bContent += `   -iface : ${x.if}\n`;
            bContent += `   -IP    : ${x.ip}\n`;
            bContent += `   -Mac   : {bold}${x.mac}{/}\n`;
            bContent += `   -Src   : ${x.src}\n`;
        }
    }
    mainBox.setContent(bContent);
    loadingBox.hide();
    mainBox.focus();
    screen.render();
};
const fetch = (writeCallback) => {
    ListRecognized = {};
    ListNotRecognized = [];
    getList().then( resp => {
        List = resp;
        if(List != undefined){
            readList();
            writeCallback();
        }
    });
};

mainBox.focus();
screen.render();
fetch(printBlessedList);
