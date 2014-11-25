module.exports = createEasyXDMSuperagentPlugin;

var easyXDM = require('easyXDM');

function createEasyXDMSuperagentPlugin() {
    console.log('easyXDM is', easyXDM);
    return function (request) {

    }
}
