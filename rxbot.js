var TigerConnect = require('tigerconnect')
var httplib = require("./httpLib")

const botId = "perscriptionbot@tigerconnect.com";
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
    botId,
    'Hello! I am the RxBot.'
  ).then(function (message) {
    const disclaimer = "This product uses publicly available data from the U.S. National Library of Medicine (NLM), National Institutes of Health, Department of Health and Human Services; NLM is not responsible for the product and does not endorse or recommend this or any other product.";
    client.messages.sendToUser(
      botId,
      disclaimer
    ).then(function (message) {
        client.messages.sendToUser(
            botId,
            'Enter "\\help" to get the list of available commands'
          ).then(function (message) {
            client.messages.sendToUser(
                botId,
                'Enter the name of the drug you want information about, in the format "\\drug amoxicillin"'
              ).then(function (message) {
                console.log('sent', message.body, 'to', message.recipient.displayName)
              })
          })
    })
  })

  client.events.connect()

  var drugTypes = []
  var drugStrength = []
  var rxcuis = []
  var rxcui = ""
  var drugName = ""
  var drugNum = ""
  var drugId = ""

  client.on('message', function (message) {
    const msgBody = message.body;
    const splitIndex = msgBody.indexOf(" ")
    const command = msgBody.substr(0, splitIndex)
    const remMsg = msgBody.substr(splitIndex + 1)

    if(command == "\\drug")
    {
        drugName = remMsg
        console.log(drugName);
        // Get RxNorm ID
        httplib.getRequestJson("https://clin-table-search.lhc.nlm.nih.gov/api/rxterms/v3/search?ef=STRENGTHS_AND_FORMS,RXCUIS&authenticity_token=&terms=" + drugName, (rxNormResp) => {
            console.log(rxNormResp)
            console.log(rxNormResp[0]);
            drugTypes = rxNormResp[1];
            console.log(drugTypes);
            drugStrength = rxNormResp[2].STRENGTHS_AND_FORMS;
            console.log(drugStrength)
            rxcuis = rxNormResp[2].RXCUIS;
            console.log(rxcuis)

            var i = 0;
            var drugTypeMsg = "Variants available are:\n\n";
            for(i = 0; i< drugTypes.length; i++)
            {
                drugTypeMsg += (i+1) + ".  " + drugTypes[i] + "\n";
            }

            console.log(drugTypeMsg);

            client.messages.sendToUser(
                botId,
                drugTypeMsg
              ).then(function (message) {
                client.messages.sendToUser(
                    botId,
                    'Enter the variant number of the drug in the format "\\str 1" to get dosage and strength information.'
                  ).then(function (message) {
                    console.log('sent', message.body, 'to', message.recipient.displayName)
                  })
              })
        });
    }
    else if(command == "\\str")
    {
        drugNum = remMsg;
        console.log(drugNum);
        var drugstr = "Strengths and Dosages available are:\n\n";
        console.log(drugStrength);
        var drugSelected = drugStrength[drugNum - 1];
        var j = 0;
        for(j = 0; j< drugSelected.length; j++)
        {
            drugstr +=  (j+1) + ".  " + drugSelected[j] + "\n";
        }
        console.log(drugstr);

        client.messages.sendToUser(
          botId,
          drugstr
        ).then(function (message) {
          client.messages.sendToUser(
              botId,
              'Enter the number of the drug in the format "\\more 1" to get more information'
            ).then(function (message) {
              console.log('sent', message.body, 'to', message.recipient.displayName)
            })
        })
    }
    else if(command == "\\more")
    {
        drugId = remMsg;
        console.log(drugId);
        console.log(rxcuis);
        rxcui = rxcuis[drugNum - 1][drugId - 1]
        var allInfoReq = "https://rxnav.nlm.nih.gov/REST/RxTerms/rxcui/"+ rxcuis[drugNum - 1][drugId - 1] +"/allinfo";
        console.log(allInfoReq)
        var moreInfo = "";
        httplib.getRequestXML(allInfoReq, (allInfoResp) => {
            var rxTerm = allInfoResp.rxtermsdata.rxtermsProperties[0]
            console.dir(rxTerm);
            const brandNames = rxTerm.brandName
            if(brandNames.length == 1 && brandNames[0] == '')
              moreInfo += "This drug doesn't have a branded version.\n";
            else if(brandNames.length > 0)
            {
              var k = 0;
              for(k = 0; k< brandNames.length; k++)
              {
                moreInfo += (k+1) + ".  " + brandNames[k] + "\n";
              }
              moreInfo += "\n";
            }

            var genericName = rxTerm.fullGenericName;
            if(genericName == "")
              moreInfo += "This drug doesn't have a generic version.\n"
            else
              moreInfo += "The full generic name of the drug is "  + genericName + "\n";

            client.messages.sendToUser(
              botId,
              moreInfo
            ).then(function (message) {
              client.messages.sendToUser(
                  botId,
                  'Enter "\\inter yes" to get information about any drug-drug interactions. Enter "\\inter no" to end interaction.'
                ).then(function (message) {
                  console.log('sent', message.body, 'to', message.recipient.displayName)
                })
            })
        })
    }
    else if(command == "\\inter")
    {
      var interResp = remMsg;
      if(interResp == "yes")
      {
        // console.log("https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=" + rxcui + "&sources=ONCHigh")
        // httplib.getRequestJson("https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=" + rxcui + "&sources=ONCHigh", (interactionsResp) => {
        //     console.log(interactionsResp)
        //   })

        var interactionsInfo = ""
        httplib.getRequestJson("https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=" + rxcui + "&sources=ONCHigh", (interactionsResp) => {
            var interactionsList = interactionsResp.interactionTypeGroup[0].interactionType[0].interactionPair
            {
              var k = 0;
              var name = "";
              var severity = "";
              for(k = 0; k < interactionsList.length; k++)
              {
                name = interactionsList[k].interactionConcept[1].minConceptItem.name
                severity = interactionsList[k].severity
                description = interactionsList[k].description
                interactionsInfo += (k + 1) + ".  " + name + ", " + severity + "\n[" + description + "]" + "\n";
              }
            }
            console.log(interactionsInfo)
            client.messages.sendToUser(
              botId,
              "Below are the names of the interacting drugs, the level of interaction, and the type of interaction.\n\n" + interactionsInfo
            )
          })
      }
      else if(interResp == "no")
      {
        client.messages.sendToUser(
          botId,
          'Enter the name of the drug you want information about, in the format "\\drug amoxicillin"'
        ).then(function (message) {
          console.log('sent', message.body, 'to', message.recipient.displayName)
        })
      }
    }
    else if(command == "\\help" || msgBody == "\\help")
    {
      var help = "Commands:\n\n";
      help += "1.  \\drug drugName - Variants of the drug available.\nFor example: \\drug amoxicillin \n\n";
      help += "2.  \\str drugNumber - Strength and Dosage Information.\nFor example: \\str 1 \n\n";
      help += "3.  \\more drugNumber - Information about branded and generic version.\nFor example: \\more 1 \n\n";
      help += "4.  \\inter yes/no - Drug-Drug interaction.\nFor example: \\inter yes";

      client.messages.sendToUser(
        botId,
        help
      ).then(function (message) {
        console.log('sent', message.body, 'to', message.recipient.displayName)
      })
    }
  })


}
