var request = require('superagent');
var superAgentEasyXDM = require('..')

var easyXDM = window.easyXDM = require('easyxdm/debug');

var apiHost = 'http://localhost:8000';
var apiUrl = apiHost + '/api';

var iframeRpc = new easyXDM.Rpc({
  remote: apiHost + "/easyxdm.html"
},
{
  remote: {
    request: {}
  }
});

window.iframeRpc = iframeRpc;

/**
 * Raw easyXDM
 */
iframeRpc.request({
  url: apiUrl,
  method: 'get'
},
function onRequestSuccess(res) {
  console.log('success req!', arguments);
  renderJSON(JSON.parse(res.data))
},
function (err) {
  renderJSON({
    kind: 'raw easyXDM GET',
    error: err
  })
});

/**
 * superagent-easyxdm/rpc-request
 */
request.get(apiUrl)
.use(superAgentEasyXDM.rpcRequest(iframeRpc))
.end(createEndCallback());

request.post(apiUrl)
.send({ requestBody: 'agapism' })
.use(superAgentEasyXDM.rpcRequest(iframeRpc))
.end(createEndCallback());

request.patch(apiUrl)
.send([
  { 
    op: "test",
    path: "/",
    value: null
  }
])
.use(superAgentEasyXDM.rpcRequest(iframeRpc))
.end(createEndCallback());

function createEndCallback() {
  return function (err, res) {
    if (err) {
      renderJSON({
        error: err,
        res: res
      });
      return;
    }
    renderJSON(res.body);
  }
}

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
