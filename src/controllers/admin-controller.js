const sharp = require("sharp");
const db = require("../models");

// Create main model \\
const Admin = db.admin;
const Doctor = db.doctors;
const User = db.users;
const Appointments = db.appointments;
const Payments = db.payments;

// Create Admin \\
const createAdmin = async (req, res) => {
  let info = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  try {
    const admin = await Admin.create(info);
    const token = await admin.generateAuthToken();

    res.status(201).send({ admin, token });
  } catch (e) {
    res.status(400).send(e);
  }
};

// Login Admin \\
const loginAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await admin.generateAuthToken();

    res.status(200).send({ admin, token });
  } catch (e) {
    res.status(400).send({ error: "Oops, Something went wrong !!" });
  }
};

// Logout Admin \\
const logoutAdmin = async (req, res) => {
  try {
    const adminTokens = JSON.parse(req.admin.tokens);

    req.admin.tokens = JSON.stringify(
      adminTokens.filter((tokenObj) => tokenObj.token !== req.token)
    );

    await req.admin.save();

    res.status(200).send(req.admin);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Read Admin Profile \\
const readAdminProfile = async (req, res) => {
  try {
    res.status(200).send(req.admin);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Update Admin Profile \\
const updateAdminProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValid = updates.every((item) => allowedUpdates.includes(item));

  if (!updates?.length > 0 || !isValid) {
    return res.status(400).send({ error: "Not a valid property to update !!" });
  }

  try {
    updates.forEach((item) => (req.admin[item] = req.body[item]));

    await req.admin.save();

    res.status(200).send(req.admin);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Upload Admin Profile Picture \\
const uploadAdminProfilePicture = async (req, res) => {
  try {
    if (!req?.file?.buffer) {
      return res.status(404).send({ error: "Please select an image file!!" });
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.admin.avatar = buffer;

    await req.admin.save();

    res.status(200).send(req.admin);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Display Admin Profile Picture \\
const displayAdminProfilePicture = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id);

    if (!admin || !admin.avatar) {
      throw new Error("Oops, Something went wrong !!");
    }

    res.set("Content-Type", "image/png");

    res.status(200).send(admin.avatar);
  } catch (e) {
    res.status(404).send({ error: "Oops, Something went wrong !!" });
  }
};

// Delete Admin Profile Picture \\
const deleteAdminProfilePicture = async (req, res) => {
  try {
    req.admin.avatar = null;

    await req.admin.save();

    res.status(200).send(req.admin);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Delete Admin Profile \\
const deleteAdminProfile = async (req, res) => {
  try {
    await req.admin.destroy();

    res.status(200).send(req.admin);
  } catch (e) {
    res.status(500).send(e);
  }
};

//-------------------- Doctor Operations --------------------\\

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

// Delete A Doctor \\
const deleteDoctor = async (req, res) => {
  try {
    const id = req.params.id;
    const adminId = req?.admin?.id;

    if (!adminId) {
      return res.status(400).send({ error: "Not Authorized !!" });
    }

    const doctor = await Doctor.destroy({ where: { id } });

    if (doctor === 0) {
      return res.status(404).send({ error: "No record found !!" });
    }

    res.status(200).send({ message: "Profile deleted successfully !!" });
  } catch (e) {
    res.status(500).send(e);
  }
};

//-------------------- User Operations --------------------\\

// Read All Users \\
const readAllUsers = async (req, res) => {
  try {
    const allUsers = await User.findAll();

    if (allUsers.length <= 0) {
      return res.status(404).send({ error: "No records found !!" });
    }

    res.status(200).send(allUsers);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Read A User \\
const readUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(404).send({ error: "No record found !!" });
    }

    res.status(200).send(user);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Delete A User \\
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const adminId = req?.admin?.id;

    if (!adminId) {
      return res.status(400).send({ error: "Not Authorized !!" });
    }

    const user = await User.destroy({ where: { id } });

    if (user === 0) {
      return res.status(404).send({ error: "No record found !!" });
    }

    res.status(200).send({ message: "Profile deleted successfully !!" });
  } catch (e) {
    res.status(500).send(e);
  }
};

//-------------------- Appointment Operations --------------------\\

// Read All Appointments \\
const readAllAppointments = async (req, res) => {
  try {
    const adminId = req.admin.id;

    if (!adminId) {
      return res.status(400).send({ error: "Not Authorized !!" });
    }

    const allAppointments = await Appointments.findAll();

    if (allAppointments.length <= 0) {
      return res.status(404).send({ error: "No records found !!" });
    }

    res.status(200).send(allAppointments);
  } catch (e) {
    res.status(500).send(e);
  }
};

//-------------------- Appointment Operations --------------------\\

// Read All Payments \\
const readAllPayments = async (req, res) => {
  try {
    const adminId = req.admin.id;

    if (!adminId) {
      return res.status(400).send({ error: "Not Authorized !!" });
    }

    const allPayments = await Payments.findAll();

    if (allPayments.length <= 0) {
      return res.status(404).send({ error: "No records found !!" });
    }

    res.status(200).send(allPayments);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  createAdmin,
  loginAdmin,
  logoutAdmin,
  readAdminProfile,
  updateAdminProfile,
  uploadAdminProfilePicture,
  displayAdminProfilePicture,
  deleteAdminProfilePicture,
  deleteAdminProfile,

  readAllDoctors,
  readDoctor,
  deleteDoctor,

  readAllUsers,
  readUser,
  deleteUser,

  readAllAppointments,

  readAllPayments,
};
