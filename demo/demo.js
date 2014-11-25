var request = require('superagent');
var superAgentEasyXDM = require('..')

request.get('./api')
.use(superAgentEasyXDM())
.end(function (err, res) {
  console.log('made req', res.body);
  console.log('saeasyxdm is', superAgentEasyXDM);

  var pre = document.createElement('pre');
  pre.appendChild(
    document.createTextNode(
      JSON.stringify(res.body, null, 2)
    )
  );

  document.body.appendChild(pre);
})

console.log("Loaded demo.js");
