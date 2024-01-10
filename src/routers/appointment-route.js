const router = require("express").Router();
const auth = require("../middlewares/auth");
const appointmentController = require("../controllers/appointment-controller");

// Schedule Appointment \\
router.post(
  "/scheduleAppointment",
  auth,
  appointmentController.scheduleAppointment
);

// Read All Appointments \\
router.get(
  "/readAllAppointments",
  auth,
  appointmentController.readAllAppointments
);

// Read An Appointment \\
router.get("/readAppointment/:id", auth, appointmentController.readAppointment);

// Update An Appointment \\
router.patch(
  "/updateAppointment/:id",
  auth,
  appointmentController.updateAppointment
);

// Delete An Appointment \\
router.delete(
  "/deleteAppointment/:id",
  auth,
  appointmentController.deleteAppointment
);

module.exports = router;
