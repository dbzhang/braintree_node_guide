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
  var trData = gateway.transparentRedirect.createCustomerData({
    redirectUrl: 'http://localhost:3000/braintree'
  });

  res.render('form.ejs', {trData: trData, braintreeUrl: gateway.transparentRedirect.url});
});

app.get('/braintree', function(req, res) {
  gateway.transparentRedirect.confirm(req._parsedUrl.query, function (err, result) {
    var customerId;
    if (result.success) {
      var message = "Created Customer with ID: " + result.customer.email;
      customerId = result.customer.id;
    }
    else {
      var message = JSON.stringify(result.errors, null, 2);
    }
    res.render('response.ejs', {result: result, message: message,
                                customerId: customerId});
  });
});

app.get('/subscriptions', function(req, res){
  var customerId = req.query["id"];
  gateway.customer.find(customerId, function (err, customer) {
    var paymentMethodToken = customer.creditCards[0].token;
    gateway.subscription.create({
      paymentMethodToken: paymentMethodToken,
      planId: 'test_plan_1'
    },
    function (err, subscriptionResult) {
      if (subscriptionResult.success) {
        var message = ' Subscription status: ' + subscriptionResult.subscription.status;
      }
      else {
        var message = subscriptionResult.message;
      }
      res.render('subscription.ejs', {message: message});
    });
  });
});

app.listen(3000);
