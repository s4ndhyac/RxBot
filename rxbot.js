var TigerConnect = require('tigerconnect')
var httplib = require("./httpLib")

var client = new TigerConnect.Client({
    baseUrl: 'https://env7-devapi.tigertext.xyz/v2',
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
    'Hello! I am the RxBot.'
  ).then(function (message) {
    const disclaimer = "This product uses publicly available data from the U.S. National Library of Medicine (NLM), National Institutes of Health, Department of Health and Human Services; NLM is not responsible for the product and does not endorse or recommend this or any other product.";
    client.messages.sendToUser(
      'cliang@tigerconnect.com',
      disclaimer
    ).then(function (message) {
        client.messages.sendToUser(
            'cliang@tigerconnect.com',
            'Enter the name of drug you want information about.'
          ).then(function (message) {
            console.log('sent', message.body, 'to', message.recipient.displayName)
          })
    })
  })

  client.events.connect()

  client.on('message', function (message) {
    const drugName = message.body
    console.log(drugName);
    // Get RxNorm ID
    httplib.getRequest("https://rxnav.nlm.nih.gov/REST/rxcui?name=" + drugName, (rxNormResp) => {
        console.log(rxNormResp)
        const rxcui = rxNormResp.rxnormdata.idGroup[0].rxnormId
        console.log(rxcui)
        
        
        
        
    });

    


  })
}