var request = require('superagent');
var superAgentEasyXDM = require('..')

var easyXDM = window.easyXDM = require('easyxdm');

var iframeRpc = new easyXDM.Rpc({
  remote: "./easyxdm.html"
},
{
  remote: {
    request: {}
  }
});

window.iframeRpc = iframeRpc;

iframeRpc.request({
  url: './api',
  method: 'get'
}, onRequestSuccess, function (err) {
  console.error('req error', err);
})

function onRequestSuccess(res) {
  console.log('success req!', arguments);
  renderJSON(JSON.parse(res.data))
}

// request.get('./api')
// .use(superAgentEasyXDM())
// .end(function (err, res) {
//   console.log('made req', res.body);
//   console.log('saeasyxdm is', superAgentEasyXDM);
//   renderJSON(req.body)
// })

function renderJSON(json) {
  var pre = document.createElement('pre');
  pre.appendChild(
    document.createTextNode(
      JSON.stringify(json, null, 2)
    )
  );

  document.body.appendChild(pre);  
}

console.log("Loaded demo.js");
