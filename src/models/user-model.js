const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
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

    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    bmi: {
      type: DataTypes.FLOAT,
      allowNull: true,
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
  User.beforeCreate(async (user, options) => {
    const { name, email, password } = user;

    user.name = name.trim();
    user.email = email.trim();
    user.password = await bcrypt.hash(password.trim(), 8);
    user.tokens = JSON.stringify([]);
    user.schAppointments = JSON.stringify([]);
  });

  // Modify values beforing updating \\
  User.beforeUpdate(async (user, options) => {
    if (user.changed("name")) {
      user.name = user.name.trim();
    } else if (user.changed("email")) {
      user.email = user.email.trim();
    } else if (user.changed("password")) {
      const trimmedPassword = user.password.trim();

      if (trimmedPassword !== user.password) {
        user.password = await bcrypt.hash(trimmedPassword, 8);
      }
    }
  });

  // Find user using email and password \\
  User.findByCredentials = async (email, password) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("Unable to login !!");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Unable to login !!");
    }

    return user;
  };

  // Calculate BMI of user \\
  User.prototype.calculateBMI = async function (height, weight) {
    const user = this;

    if (!(height || weight)) {
      throw new Error("Unable to calculate BMI !!");
    }

    try {
      const heightInMeters = height / 100;
      const heightSquared = Math.pow(heightInMeters, 2);
      const calcBMI = weight / heightSquared;

      user.bmi = Math.round(calcBMI);

      return calcBMI;
    } catch (e) {
      throw new Error("Unable to calculate BMI !!");
    }
  };

  // Instance method to generate auth token \\
  User.prototype.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
      { id: user.id.toString(), userType: "user" },
      process.env.JWT_SECRET
    );

    try {
      // Get the current tokens as an array
      let tokens = JSON.parse(user.tokens || "[]");

      // Add a new token object
      tokens.push({ token });

      // Update the 'tokens' field with the updated array by serializing it back to a string
      user.tokens = JSON.stringify(tokens);

      return token;
    } catch (e) {
      throw new Error("Unable to generate authentication token !!");
    }
  };

  // Instance method to exclude sensitive fields from JSON serialization \\
  User.prototype.toJSON = function () {
    const { password, tokens, avatar, ...values } = this.get();

    return values;
  };

  return User;
};
