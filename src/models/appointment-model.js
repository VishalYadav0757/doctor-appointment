module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define("appointment", {
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: false,
    },

    phone: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [10, 10], // Enforce 10 digits for Indian phone numbers
      },
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    duration: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    typeOfAppointment: {
      type: DataTypes.ENUM(
        "routine check-up",
        "follow-up",
        "specific concern",
        "others"
      ),
      allowNull: false,
    },

    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    roomId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },

    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
  });

  // Modify values beforing creating \\
  Appointment.beforeCreate(async (appointment, options) => {
    const fieldsToTrim = [
      "gender",
      "reason",
      "time",
      "duration",
      "typeOfAppointment",
    ];

    fieldsToTrim.forEach((field) => {
      if (appointment[field]) {
        appointment[field] = appointment[field].trim();
      }
    });
  });

  // Modify values beforing updating \\
  Appointment.beforeUpdate(async (appointment, options) => {
    const fieldsToTrim = [
      "gender",
      "reason",
      "time",
      "duration",
      "typeOfAppointment",
    ];

    fieldsToTrim.forEach((field) => {
      if (appointment.changed(field) && appointment[field]) {
        appointment[field] = appointment[field].trim();
      }
    });
  });

  // Instance method to generate room id \\
  Appointment.prototype.generateRoomId = async function () {
    const appointment = this;

    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);

      result += characters.charAt(randomIndex);
    }

    appointment.roomId = result;

    await appointment.save();

    return result;
  };

  return Appointment;
};
