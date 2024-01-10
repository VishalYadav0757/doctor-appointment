const db = require("../models");

// Create main model \\
const Appointment = db.appointments;
const Payment = db.payments;

// Initiate Payment \\
const initiatePayment = async (req, res) => {
  try {
    const id = req.params.id;
    const { amount, currency, description, status } = req.body;

    const appointmentData = await Appointment.findByPk(id);

    if (!appointmentData) {
      return res
        .status(404)
        .send({ error: "No appointment found with the provided ID !!" });
    }

    let info = {
      appointmentId: id,
      amount,
      currency: currency || "INR",
      description,
      status,
    };

    const payment = await Payment.create(info);
    await payment.generateToken();

    appointmentData.paymentStatus = status;

    await appointmentData.save();

    res.status(201).send(payment);

    return payment;
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = {
  initiatePayment,
};
