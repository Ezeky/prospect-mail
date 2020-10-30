
// wait for element to be created
const init = function () {
    const notificationContainer = document.querySelector('.ms-Fabric')
    if (!notificationContainer)
        return setTimeout(init, 50);

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            const newNotification = [].slice.apply(mutation.addedNodes)
                .filter(el => el instanceof Element && el.querySelector('[data-storybook="reminder"]'))
                .map(el => el.querySelector('[data-storybook="reminder"]'))

            if (!newNotification)
                return;

            const reminder = newNotification.filter(el => el.matches('[data-storybook="reminder"]'));
            if (reminder.length)
                reminder.forEach(el => {
                    debugger;
                    let title;
                    try{
                        title = el.querySelector('button>span>div>div>div').innerText
                    } catch(e){console.log('can\' get title')}
                    let inTime;
                    try{
                        inTime = el.querySelector('button>span>div>div>div:nth-of-type(2)').innerText
                    } catch(e){console.log('can\' get inTime')}
                    let time;
                    try{
                        time = el.querySelector('button>span>div>div:nth-of-type(2)>div').innerText
                    } catch(e){console.log('can\' get time')}
                    let where;
                    try{
                        where = el.querySelector('button>span>div>div:nth-of-type(2)>div:nth-of-type(2)').innerText
                    } catch(e){console.log('can\' get where')}
                    let body = ''
                    body += `${time || ''} ${title || ''}\n`
                    if(where)
                        body += `@${where || ''}`

                    const hash = `${title}${time}${where}`.hashCode()
                    console.log('send notification')
                    nativeNotification({
                        hash,
                        title: `Meeting ${/\d/.test(inTime) ? `in ${inTime || ''}` : inTime || ''}`,
                        critical: /ago$/.test(inTime),
                        body
                    })

                    if(/^\d* min$|now/.test(inTime)){
                        console.log('sending critical meeting', (parseInt(inTime) - 1) * 1000)
                        setTimeout(() => {
                            console.log('times up')
                            nativeNotification({
                                hash,
                                title: `Meeting now!`,
                                critical: true,
                                body
                            })
                        }, (parseInt(inTime) - 1) * 60 * 1000)
                    }
                })

        })
    });
    observer.observe(notificationContainer, { childList: true, subtree: true });
    console.log('observer created', notificationContainer.cloneNode(true))
}
init();

function nativeNotification(event){
    const electron = require('electron')
    electron.ipcRenderer.send('newNotification', event);
}



// setTimeout(() => {
//     console.log('after timeout')
//     console.log(document.querySelector('#app'))

//     const electron = require('electron');

//     let observer = new MutationObserver(mutations => {
//         mutations.forEach(mutation => {
//             debugger;
//             // const newUnreadMessages = [].slice.apply(mutation.addedNodes).filter(el =>  el.matches('[aria-label*="Unread"]'))
//             // debugger;
//             // if(!newUnreadMessages.length) return;
//             // debugger;
//             // electron.ipcRenderer.send('updateUnread', unreadSpan.hasChildNodes());
//             // // Scrape messages and pop up a notification
//             // var unread = document.querySelectorAll('[role="listbox"][aria-label*="Message list"]>div>div[aria-label*="Unread"]');
//             // const body = [].slice.apply(unread)
//             //     .map(el => el.getAttribute("aria-label").substring(7, 127) + '\\n')

//             // if (!body) return;

//             // var notification = new Notification(unread.length + " New Messages", {
//             //     body: body,
//             //     icon: "assets/outlook_linux_black.png"
//             // });
//             // notification.onclick = () => {
//             //     electron.ipcRenderer.send('show');
//             // };
//         });
//     });

//     observer.observe(document.querySelector('.ms-Fabric'), { childList: true });

//     // If the div containing reminders gets taller we probably got a new
//     // reminder, so force the window to the top.
//     let reminders = document.getElementsByClassName("_1BWPyOkN5zNVyfbTDKK1gM");
//     let height = 0;
//     let reminderObserver = new MutationObserver(mutations => {
//         mutations.forEach(mutation => {
//             if (reminders[0].clientHeight > height) {
//                 require('electron').ipcRenderer.send('show');
//             }
//             height = reminders[0].clientHeight;
//         });
//     });

//     if (reminders.length) {
//         reminderObserver.observe(reminders[0], { childList: true });
//     }

// },100);

// hash tool
Object.defineProperty(String.prototype, 'hashCode', {
    value: function() {
      var hash = 0, i, chr;
      for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }
  });