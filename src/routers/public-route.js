const router = require("express").Router();
const publicController = require("../controllers/public-controller");

// Calculate BMI \\
router.post("/calculateBMI", publicController.calculateBMI);

// Read All Doctors \\
router.get("/readAllDoctors", publicController.readAllDoctors);

// Read A Doctor \\
router.get("/readDoctor/:id", publicController.readDoctor);

module.exports = router;
