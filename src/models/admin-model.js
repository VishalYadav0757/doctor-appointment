const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define("admin", {
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
  Admin.beforeCreate(async (admin, options) => {
    const { name, email, password } = admin;

    admin.name = name.trim();
    admin.email = email.trim();
    admin.password = await bcrypt.hash(password.trim(), 8);
    admin.tokens = JSON.stringify([]);
  });

  // Modify values beforing updating \\
  Admin.beforeUpdate(async (admin, options) => {
    if (admin.changed("name")) {
      admin.name = admin.name.trim();
    } else if (admin.changed("email")) {
      admin.email = admin.email.trim();
    } else if (admin.changed("password")) {
      const trimmedPassword = admin.password.trim();

      if (trimmedPassword !== admin.password) {
        admin.password = await bcrypt.hash(trimmedPassword, 8);
      }
    }
  });

  // Find admin using email and password \\
  Admin.findByCredentials = async (email, password) => {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      throw new Error("Unable to login !!");
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      throw new Error("Unable to login !!");
    }

    return admin;
  };

  // Instance method to generate auth token \\
  Admin.prototype.generateAuthToken = async function () {
    const admin = this;
    const token = jwt.sign(
      { id: admin.id.toString(), userType: "admin" },
      process.env.JWT_SECRET
    );

    try {
      // Get the current tokens as an array
      let tokens = JSON.parse(admin.tokens || "[]");

      // Add a new token object
      tokens.push({ token });

      // Update the 'tokens' field with the updated array by serializing it back to a string
      admin.tokens = JSON.stringify(tokens);

      // Save the updated tokens back to the database
      await admin.save();
    } catch (e) {
      throw new Error("Unable to generate authentication token !!");
    }

    return token;
  };

  // Instance method to exclude sensitive fields from JSON serialization \\
  Admin.prototype.toJSON = function () {
    const { password, tokens, avatar, ...values } = this.get();

    return values;
  };

  return Admin;
};
