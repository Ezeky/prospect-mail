module.exports = ({win}) => {
    win.webContents.executeJavaScript(`
        // const electron = require('electron');
        // setTimeout(console.log, 1000, 'hellow world')
    `);
}