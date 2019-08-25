# RxBot
- AI Bot made as part of TigerConnect Hack 2019 uses the TigerConnect Messenger app and sdk

- Uses the NLM-NIH open data made available through the RxNav set of APIs https://rxnav.nlm.nih.gov/APIsOverview.html

- Uses the Wit.ai AI framework to enable human-like conversational interactions

- Type in the `\help` command to get a list of all available commands

## Usage
To run the bot follow these steps:
- Clone the repository, cd into the repo and run
`npm install `
- Add your credentials to `rxbot.js` 
  - `botId`
  - `baseUrl`
  - `defaultOrganizationId`
  - `Username` and `Password` to sign in
- Run `node rxbot.js`
