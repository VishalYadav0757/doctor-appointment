const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define("doctor", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(email) {
        this.setDataValue("email", email.toLowerCase());
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isLongEnough(value) {
          if (value.length < 8) {
            throw new Error("Password should be at least 8 characters long !!");
          }
        },
        isNotPassword(value) {
          if (value.toLowerCase() === "password") {
            throw new Error('Password cannot be "password !!"');
          }
        },
      },
    },

    phone: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [10, 10], // Enforce 10 digits for Indian phone numbers
      },
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    qualifications: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    clinicName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    workingHours: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    consultationFees: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    servicesProvided: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const serviceString = this.getDataValue("servicesProvided");
        return JSON.parse(serviceString);
      },
      set(value) {
        this.setDataValue("servicesProvided", JSON.stringify(value));
      },
    },

    schAppointments: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const schAppointments = this.getDataValue("schAppointments");
        return JSON.parse(schAppointments);
      },
      set(value) {
        this.setDataValue("schAppointments", JSON.stringify(value));
      },
    },

    avatar: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },

    tokens: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "[]",
      get() {
        const tokensString = this.getDataValue("tokens");
        return JSON.parse(tokensString);
      },
      set(value) {
        this.setDataValue("tokens", JSON.stringify(value));
      },
    },
  });

  // Modify values beforing creating \\
  Doctor.beforeCreate(async (doctor, options) => {
    const fieldsToTrim = [
      "name",
      "email",
      "address",
      "specialization",
      "qualifications",
      "clinicName",
      "workingHours",
      "bio",
    ];

    fieldsToTrim.forEach((field) => {
      if (doctor[field]) {
        doctor[field] = doctor[field].trim();
      }
    });

    if (doctor.password) {
      doctor.password = await bcrypt.hash(doctor.password.trim(), 8);
    }

    if (doctor.experience) {
      doctor.experience = parseInt(doctor.experience);
    }

    if (doctor.consultationFees) {
      doctor.consultationFees = parseFloat(doctor.consultationFees);
    }

    doctor.servicesProvided = JSON.stringify([]);
    doctor.schAppointments = JSON.stringify([]);
    doctor.tokens = JSON.stringify([]);
  });

  // Modify values beforing updating \\
  Doctor.beforeUpdate(async (doctor, options) => {
    const fieldsToTrim = [
      "name",
      "email",
      "address",
      "specialization",
      "qualifications",
      "clinicName",
      "workingHours",
      "bio",
    ];

    fieldsToTrim.forEach((field) => {
      if (doctor.changed(field) && doctor[field]) {
        doctor[field] = doctor[field].trim();
      }
    });

    if (doctor.changed("password")) {
      const trimmedPassword = doctor.password.trim();

      if (trimmedPassword !== doctor.password) {
        doctor.password = await bcrypt.hash(trimmedPassword, 8);
      }
    }

    if (doctor.changed("experience")) {
      doctor.experience = parseInt(doctor.experience);
    }

    if (doctor.changed("consultationFees")) {
      doctor.consultationFees = parseFloat(doctor.consultationFees);
    }
  });

  // Find doctor using email and password \\
  Doctor.findByCredentials = async (email, password) => {
    const doctor = await Doctor.findOne({ where: { email } });

    if (!doctor) {
      throw new Error("Unable to login !!");
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      throw new Error("Unable to login !!");
    }

    return doctor;
  };

  // Instance method to generate auth token \\
  Doctor.prototype.generateAuthToken = async function () {
    const doctor = this;
    const token = jwt.sign(
      { id: doctor.id.toString(), userType: "doctor" },
      process.env.JWT_SECRET
    );

    try {
      // Get the current tokens as an array
      let tokens = JSON.parse(doctor.tokens || "[]");

      // Add a new token object
      tokens.push({ token });

      // Update the 'tokens' field with the updated array by serializing it back to a string
      doctor.tokens = JSON.stringify(tokens);

      // Save the updated tokens back to the database
      await doctor.save();
    } catch (e) {
      throw new Error("Unable to generate authentication token !!");
    }

    return token;
  };

  // Instance method to convert "services provided" string to stringified array \\
  Doctor.prototype.changeServicesProvided = async function (serviceString) {
    const doctor = this;
    const servicesArray = serviceString
      .split(",")
      .map((service) => ({ service: service.trim() }));

    try {
      doctor.servicesProvided = JSON.stringify(servicesArray);

      await doctor.save();
    } catch (e) {
      throw new Error("Something went wrong !!");
    }

    return servicesArray;
  };

  // Instance method to exclude sensitive fields from JSON serialization \\
  Doctor.prototype.toJSON = function () {
    const { password, tokens, avatar, ...values } = this.get();

    return values;
  };

  return Doctor;
};
