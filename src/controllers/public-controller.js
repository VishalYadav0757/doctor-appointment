const db = require("../models");

// Create Main Model \\
const Doctor = db.doctors;

// Calculate BMI \\
const calculateBMI = async (req, res) => {
  try {
    const { height, weight } = req.body;

    if (!(height || weight)) {
      return res.status(400).send({ error: "Unable to calculate BMI !!" });
    }

    const heightInMeters = height / 100;
    const heightSquared = Math.pow(heightInMeters, 2);
    const calcBMI = weight / heightSquared;

    res.status(200).send({ bmi: Math.round(calcBMI) });
  } catch (e) {
    res.status(500).send(e);
  }
};

// Read All Doctors \\
const readAllDoctors = async (req, res) => {
  try {
    const allDoctors = await Doctor.findAll();

    if (allDoctors.length <= 0) {
      return res.status(404).send({ error: "No records found !!" });
    }

    res.status(200).send(allDoctors);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Read A Doctor \\
const readDoctor = async (req, res) => {
  try {
    const id = req.params.id;
    const doctor = await Doctor.findOne({ where: { id } });

    if (!doctor) {
      return res.status(404).send({ error: "No record found !!" });
    }

    res.status(200).send(doctor);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  calculateBMI,
  readAllDoctors,
  readDoctor,
};
