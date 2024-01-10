const router = require("express").Router();
const auth = require("../middlewares/auth");
const paymentController = require("../controllers/payment-controller");

// Initiate Payment \\
router.post("/initiatePayment/:id", auth, paymentController.initiatePayment);

module.exports = router;
