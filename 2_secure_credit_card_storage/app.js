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
      res.send("<h1>Customer created with name: " + result.customer.firstName + " " + result.customer.lastName + "</h1>");
    } else {
      res.send("<h1>Error: " + result.message + "</h1>");
    }
  });
});

app.listen(3000);
