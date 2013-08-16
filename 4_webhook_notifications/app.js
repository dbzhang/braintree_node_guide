var braintree = require("braintree");
var express = require("express");
var app = express();

app.use(express.bodyParser());

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "use_your_merchant_id",
  publicKey: "use_your_public_key",
  privateKey: "use_your_private_key"
});

app.get("/", function (req, res) {
  res.render("braintree.ejs");
});

app.post("/create_customer", function (req, res) {
  var customerRequest = {
    firstName: req.body.first_name,
    lastName: req.body.last_name,
    creditCard: {
      number: req.body.number,
      cvv: req.body.cvv,
      expirationMonth: req.body.month,
      expirationYear: req.body.year,
      billingAddress: {
        postalCode: req.body.postal_code
      }
    }
  };

  gateway.customer.create(customerRequest, function (err, result) {
    if (result.success) {
      res.send(
        "<h1>Customer created with name: " + result.customer.firstName + " " + result.customer.lastName + "</h1>" +
         "<a href=\"/subscriptions?id=" + result.customer.id + "\">Click here to sign this Customer up for a recurring payment</a>"
      );
    } else {
      res.send("<h1>Error: " + result.message + "</h1>");
    }
  });
});

app.get("/subscriptions", function (req, res) {
  var customerId = req.query.id;

  gateway.customer.find(customerId, function (err, customer) {
    if (err) {
        res.send("<h1>No customer found for id: " + req.query.id + "</h1>");
    } else {
      var subscriptionRequest = {
        paymentMethodToken: customer.creditCards[0].token,
        planId: "test_plan_1"
      };

      gateway.subscription.create(subscriptionRequest, function (err, result) {
        res.send("<h1>Subscription Status " + result.subscription.status + "</h1>");
      });
    }
  });
});

app.get("/webhooks", function (req, res) {
  res.send(gateway.webhookNotification.verify(req.query.bt_challenge));
});

app.post("/webhooks", function (req, res) {
  gateway.webhookNotification.parse(
    req.body.bt_signature,
    req.body.bt_payload,
    function (err, webhookNotification) {
      console.log("[Webhook Received " + webhookNotification.timestamp + "] | Kind: " + webhookNotification.kind + " | Subscription: " + webhookNotification.subscription.id);
    }
  );
  res.send(200);
});

app.listen(3000);
