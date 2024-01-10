const sharp = require("sharp");
const db = require("../models");

// Create main model \\
const Doctor = db.doctors;

// Create Doctor \\
const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);

    await doctor.changeServicesProvided(req.body.servicesProvided);

    const token = await doctor.generateAuthToken();

    res.status(201).send({ doctor, token });
  } catch (e) {
    res.status(400).send(e);
  }
};

// Login Doctor \\
const loginDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await doctor.generateAuthToken();

    res.status(200).send({ doctor, token });
  } catch (e) {
    res.status(400).send({ error: "Oops, Something went wrong !!" });
  }
};

// Logout Doctor \\
const logoutDoctor = async (req, res) => {
  try {
    const doctorTokens = JSON.parse(req.doctor.tokens);

    req.doctor.tokens = JSON.stringify(
      doctorTokens.filter((tokenObj) => tokenObj.token !== req.token)
    );

    await req.doctor.save();

    res.status(200).send(req.doctor);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Read Doctor Profile \\
const readDoctorProfile = async (req, res) => {
  try {
    res.status(200).send(req.doctor);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Update Doctor Profile \\
const updateDoctorProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "email",
    "password",
    "phone",
    "address",
    "specialization",
    "qualifications",
    "experience",
    "clinicName",
    "workingHours",
    "consultationFees",
    "bio",
    "servicesProvided",
  ];
  const isValid = updates.every((item) => allowedUpdates.includes(item));

  if (!updates?.length > 0 || !isValid) {
    return res.status(400).send({ error: "Not a valid property to update !!" });
  }

  try {
    if (updates.includes("servicesProvided")) {
      const updatedServices = await req.doctor.changeServicesProvided(
        req.body.servicesProvided
      );

      req.doctor.servicesProvided = updatedServices;
    } else {
      updates.forEach((item) => (req.doctor[item] = req.body[item]));
    }

    await req.doctor.save();

    res.status(200).send(req.doctor);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Upload Doctor Profile Picture \\
const uploadDoctorProfilePicture = async (req, res) => {
  try {
    if (!req?.file?.buffer) {
      return res.status(404).send({ error: "Please select an image file!!" });
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.doctor.avatar = buffer;

    await req.doctor.save();

    res.status(200).send(req.doctor);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Display Doctor Profile Picture \\
const displayDoctorProfilePicture = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.doctor.id);

    if (!doctor || !doctor.avatar) {
      throw new Error("Oops, Something went wrong !!");
    }

    res.set("Content-Type", "image/png");

    res.status(200).send(doctor.avatar);
  } catch (e) {
    res.status(404).send({ error: "Oops, Something went wrong !!" });
  }
};

// Delete Doctor Profile Picture \\
const deleteDoctorProfilePicture = async (req, res) => {
  try {
    req.doctor.avatar = null;

    await req.doctor.save();

    res.status(200).send(req.doctor);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Delete Doctor Profile \\
const deleteDoctorProfile = async (req, res) => {
  try {
    await req.doctor.destroy();

    res.status(200).send(req.doctor);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  createDoctor,
  loginDoctor,
  logoutDoctor,
  readDoctorProfile,
  updateDoctorProfile,
  uploadDoctorProfilePicture,
  displayDoctorProfilePicture,
  deleteDoctorProfilePicture,
  deleteDoctorProfile,
};
