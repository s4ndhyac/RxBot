var TigerConnect = require('tigerconnect')
var rxbot = require('./rxbotClient');

var client = new TigerConnect.Client({
    baseUrl: 'https://env5-devapi.tigertext.xyz/v2',
    // baseUrl: 'https://developer.tigertext.me/v2',
    defaultOrganizationId: '3D5qqmf6f6RgVzFwcbZoIPuW', // use the default org to send all messages in a specific organization unless specified otherwise
    events: {
      autoAck: false,
      isTyping: true,
      multiOrg: true,
      noOfflineMessages: false, // make this true if previous messages should be disregarded
      autoDeliver: false,
      hidden: false,
      closeAfterMessages: false,
    },
    logLevel: 'error', // debug/info/warn/error/fatal
  })

client.signIn('schandramohan@tigerconnect.com', 'oUALi3aRmS0\'', { udid: 'unique-device-id' }).then(function (session) {
  onSignedIn(session)
})

function onSignedIn(session) {
  console.log('Signed in as', session.user.displayName)

  client.messages.sendToUser(
    'cliang@tigerconnect.com',
    'hello!'
  ).then(function (message) {
    console.log('sent', message.body, 'to', message.recipient.displayName)
  })

  client.events.connect()

  client.on('message', function (message) {
    console.log(
      'message event',
      message.sender.displayName,
      'to',
      message.recipient.displayName,
      ':',
      message.body
    )
  })
}