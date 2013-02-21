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

app.post("/create_transaction", function (req, res) {
  var saleRequest = {
    amount: "1000.00",
    creditCard: {
      number: req.body.number,
      cvv: req.body.cvv,
      expirationMonth: req.body.month,
      expirationYear: req.body.year
    },
    options: {
      submitForSettlement: true
    }
  };

  gateway.transaction.sale(saleRequest, function (err, result) {
    if (result.success) {
      res.send("<h1>Success! Transaction ID: " + result.transaction.id + "</h1>");
    } else {
      res.send("<h1>Error:  " + result.message + "</h1>");
    }
  });
});

app.listen(3000);
