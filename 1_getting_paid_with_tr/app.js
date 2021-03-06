var braintree = require('braintree');
var app = require('express').createServer();
var ejs = require('ejs');

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "your_merchant_id",
  publicKey: "your_public_key",
  privateKey: "your_private_key"
});

app.get('/', function(req, res){
  var trData = gateway.transparentRedirect.transactionData({
    redirectUrl: 'http://localhost:3000/braintree',
      transaction: {
        type: 'sale',
        amount: '10000.00',
        options: {submitForSettlement: true}
      }
  });

  res.render('form.ejs', {trData: trData, braintreeUrl: gateway.transparentRedirect.url});
});

app.get('/braintree', function(req, res) {
  gateway.transparentRedirect.confirm(req._parsedUrl.query, function (err, result) {
    var message;
    if (result.success) {
      message = "Transaction Successful";
    }
    else {
      message = JSON.stringify(result.errors, null, 2);
    }
    res.render('response.ejs', {result: result, message: message});
  });
});

app.listen(3000);
