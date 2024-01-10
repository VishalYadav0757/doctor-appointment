const express = require("express");
const cors = require("cors");
const publicRouter = require("./routers/public-route");
const adminRouter = require("./routers/admin-route");
const doctorRouter = require("./routers/doctor-route");
const userRouter = require("./routers/user-route");
const appointmentRouter = require("./routers/appointment-route");
const paymentRouter = require("./routers/payment-route");

const app = express();

var corsOptions = {
  origin: ["https://localhost:3000", "http://localhost:3000"],
};

// Middlewares \\
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers \\
app.use("/api/public", publicRouter);
app.use("/api/admins", adminRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/users", userRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/payments", paymentRouter);

// Home Page \\
app.get("/", (req, res) => {
  res.json({ message: "Hello from API" });
});

module.exports = app;
