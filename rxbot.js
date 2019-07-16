var TigerConnect = require('tigerconnect')
var rxbot = require('./rxbotClient');

var client = new TigerConnect.Client({
    baseUrl: 'https://env7-devapi.tigertext.xyz/v2',
    // baseUrl: 'https://developer.tigertext.me/v2',
    defaultOrganizationId: 'HP8FBxTpDl5AWanDFc3AY4Pe', // use the default org to send all messages in a specific organization unless specified otherwise
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

client.signIn('schandramohan@tigerconnect.com', 'Password!1', { udid: 'unique-device-id' }).then(function (session) {
  onSignedIn(session)
})

function onSignedIn(session) {
  console.log('Signed in as', session.user.displayName)

  client.messages.sendToUser(
    'cliang@tigerconnect.com',
    'hello3!'
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