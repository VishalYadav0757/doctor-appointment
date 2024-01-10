const { Op } = require("sequelize");
const db = require("../models");

// Create main model \\
const Doctor = db.doctors;
const User = db.users;
const Appointment = db.appointments;

// Schedule Appointment \\
const scheduleAppointment = async (req, res) => {
  try {
    const {
      gender,
      phone,
      reason,
      date,
      time,
      duration,
      typeOfAppointment,
      doctorId,
    } = req.body;

    const userid = req?.user?.id;
    const userName = req?.user?.name;

    if (!(userid || userName)) {
      return res.status(400).send({ error: "Cannot schedule appointment !!" });
    }

    const doctorExists = await Doctor.findByPk(doctorId);

    if (!doctorExists) {
      return res.status(404).send({ error: "Doctor not found !!" });
    }

    // Check if the user already has an appointment at the specified date, time, and duration
    const existingAppointment = await Appointment.findOne({
      where: {
        userId: userid,
        date: {
          [Op.eq]: new Date(date), // Convert the date string to a JavaScript Date object
        },
        time: time,
        duration: duration,
      },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .send({ error: "You already have an appointment at this time!" });
    }

    // Check if the doctor already has an appointment at the specified date, time, and duration
    const doctorAppointment = await Appointment.findOne({
      where: {
        doctorId: doctorId,
        date: {
          [Op.eq]: new Date(date), // Convert the date string to a JavaScript Date object
        },
        time: time,
        duration: duration,
      },
    });

    if (doctorAppointment) {
      return res
        .status(400)
        .send({ error: "Doctor is already booked at this time!" });
    }

    let info = {
      gender,
      phone,
      reason,
      date,
      time,
      duration,
      typeOfAppointment,
      doctorId,
      userId: userid,
    };

    const appointment = await Appointment.create(info);
    const roomId = await appointment.generateRoomId();

    const userData = await User.findByPk(userid);
    const userAppointments = JSON.parse(userData.schAppointments || "[]");
    const doctorAppointments = JSON.parse(doctorExists.schAppointments || "[]");

    userAppointments.push({
      appointment: {
        doctor: doctorExists?.name,
        date: date,
        time: time,
        duration: duration,
      },
    });
    userData.schAppointments = JSON.stringify(userAppointments);

    doctorAppointments.push({
      appointment: {
        patient: userData?.name,
        date: date,
        time: time,
        duration: duration,
      },
    });
    doctorExists.schAppointments = JSON.stringify(doctorAppointments);

    await userData.save();
    await doctorExists.save();

    res.status(201).send({ appointment, roomId });
  } catch (e) {
    res.status(400).send(e);
  }
};

// Read All Appointments \\
const readAllAppointments = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const doctorId = req?.doctor?.id;

    if (!userId && !doctorId) {
      return res
        .status(400)
        .send({ error: "Unauthorized to perform this action !!" });
    }

    const whereClause = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (doctorId) {
      whereClause.doctorId = doctorId;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
    });

    res.status(200).send(appointments);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Read An Appointment \\
const readAppointment = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req?.user?.id;
    const doctorId = req?.doctor?.id;

    if (!(userId || doctorId)) {
      return res
        .status(400)
        .send({ error: "Unauthorized to perform this action !!" });
    }

    const appointment = await Appointment.findOne({ where: { id } });

    if (!appointment) {
      return res.status(404).send({ error: "No record found !!" });
    }

    res.status(200).send(appointment);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Update An Appointment \\
const updateAppointment = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the appointment
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).send({ error: "No records found !!" });
    }

    const userId = req?.user?.id;
    const doctorId = req?.doctor?.id;

    // Check if the requester is either the user or the doctor associated with the appointment
    if (userId !== appointment.userId && doctorId !== appointment.doctorId) {
      return res
        .status(403)
        .send({ error: "Unauthorized to perform this action !!" });
    }

    // Convert req.body object to array of keys
    const updates = Object.keys(req.body);

    // Only these property values can be updated
    const allowedUpdates = [
      "phone",
      "reason",
      "date",
      "time",
      "duration",
      "typeOfAppointment",
    ];

    // Check if the property value being updated is valid or not
    const isValid = updates.every((item) => allowedUpdates.includes(item));

    // If not valid throw error
    if (!isValid) {
      return res.status(400).send({ error: "Cannot update appointment !!" });
    }

    updates.forEach((item) => (appointment[item] = req.body[item]));

    await appointment.save();

    res.status(200).send(appointment);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Delete An Appointment \\
const deleteAppointment = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the appointment
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).send({ error: "No records found !!" });
    }

    const userId = req?.user?.id;
    const doctorId = req?.doctor?.id;

    // Check if the requester is either the user or the doctor associated with the appointment
    if (userId !== appointment.userId && doctorId !== appointment.doctorId) {
      return res
        .status(403)
        .send({ error: "Unauthorized to perform this action !!" });
    }

    // Remove the appointment from the user's scheduled appointments
    const userData = await User.findByPk(appointment.userId);

    if (userData) {
      const userAppointments = JSON.parse(userData.schAppointments || "[]");
      const updatedAppointments = userAppointments.filter(
        (appt) => appt.appointment.time !== appointment.time
      );

      userData.schAppointments = JSON.stringify(updatedAppointments);

      await userData.save();
    }

    // Remove the appointment from the doctor's scheduled appointments
    const doctorData = await Doctor.findByPk(appointment.doctorId);

    if (doctorData) {
      const doctorAppointments = JSON.parse(doctorData.schAppointments || "[]");
      const updatedAppointments = doctorAppointments.filter(
        (appt) => appt.appointment.time !== appointment.time
      );

      doctorData.schAppointments = JSON.stringify(updatedAppointments);

      await doctorData.save();
    }

    await appointment.destroy();

    res.status(200).send(appointment);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  scheduleAppointment,
  readAllAppointments,
  readAppointment,
  updateAppointment,
  deleteAppointment,
};
