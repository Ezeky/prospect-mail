const { Notification, BrowserWindow, shell, ipcMain } = require('electron')
const settings = require('electron-settings')
const CssInjector = require('../js/css-injector')
const path = require('path')

const outlookUrl = 'https://outlook.office.com/mail'
const deeplinkUrls = ['outlook.live.com/mail/deeplink', 'outlook.office365.com/mail/deeplink', 'outlook.office.com/mail/deeplink', 'outlook.office.com/calendar/deeplink']
const outlookUrls = ['outlook.live.com', 'outlook.office365.com', 'outlook.office.com']
const fs = require('fs');

class MailWindowController {
    constructor() {
        this.init()
    }

    init() {
        // Get configurations.
        const showWindowFrame = settings.get('showWindowFrame', true)
        this.browserCode = fs.readFileSync(__dirname + '/browser-code.js', 'utf8')

        // Create the browser window.
        this.win = new BrowserWindow({
            x: 100,
            y: 100,
            width: 1400,
            height: 900,
            frame: showWindowFrame,
            autoHideMenuBar: true,
            show: false,
            title: 'Prospect Mail',
            icon: path.join(__dirname, '../../assets/outlook_linux_black.png'),
            webPreferences: {
                nodeIntegration: true,
                spellcheck: true
            }
        })

        // and load the index.html of the app.
        this.win.loadURL(outlookUrl)

        // Show window handler
        ipcMain.on('show', (event) => {
            this.show()
        })

        // insert styles
        this.win.webContents.on('did-finish-load', () => {
            console.log('loaded')
            this.win.webContents.insertCSS(CssInjector.main)
            if (!showWindowFrame) this.win.webContents.insertCSS(CssInjector.noFrame)

            this.addUnreadNumberObserver()

            this.win.show()
        })

        // prevent the app quit, hide the window instead.
        this.win.on('close', (e) => {
            if (this.win.isVisible()) {
                e.preventDefault()
                this.win.hide()
            }
        })

        // Emitted when the window is closed.
        this.win.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.win = null
        })

        // Open the new window in external browser
        this.win.webContents.on('new-window', this.openInBrowser)

        // display native notification
        const alreadySendNotifications = [];
        ipcMain.on("newNotification", ( event, info ) => {
            if(alreadySendNotifications.indexOf(info.hash) > -1 && !info.critical)
                return;

            var notification = new Notification({
                title: info.title,
                body: info.body,
                // silent: false,
                timeoutType: 'default',
                urgency: info.critical ? 'critical': 'normal',
                icon: "assets/outlook_linux_black.png"
            });
            notification.on('close', () => {
                this.show();
            });
            notification.show();
            alreadySendNotifications.push(info.hash)
        } );
    }

    addUnreadNumberObserver() {
        try{
            this.win.webContents.executeJavaScript(this.browserCode)
        } catch(e){console.error(e)}
    }

    toggleWindow() {
        if (this.win.isFocused()) {
            this.win.hide()
        } else {
            this.show()
        }
    }

    openInBrowser(e, url) {
        console.log(url)
        if (new RegExp(deeplinkUrls.join('|')).test(url)) {
            // Default action - if the user wants to open mail in a new window - let them.
        }
        else if (new RegExp(outlookUrls.join('|')).test(url)) {
            // Open calendar, contacts and tasks in the same window
            e.preventDefault()
            this.loadURL(url)
        }
        else {
            // Send everything else to the browser
            e.preventDefault()
            shell.openExternal(url)
        }
    }

    show() {
        this.win.show()
        this.win.focus()
    }
}

module.exports = MailWindowController
