module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define("payment", {
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "INR",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("success", "fail"),
      allowNull: false,
    },

    token: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
  });

  // Modify values beforing creating \\
  Payment.beforeCreate(async (payment, options) => {
    const fieldsToTrim = ["currency", "description"];

    fieldsToTrim.forEach((field) => {
      if (payment[field]) {
        payment[field] = payment[field].trim();
      }
    });

    if (payment.amount) {
      payment.amount = parseFloat(payment.amount);
    }
  });

  // Modify values beforing updating \\
  Payment.beforeUpdate(async (payment, options) => {
    const fieldsToTrim = ["currency", "description"];

    fieldsToTrim.forEach((field) => {
      if (payment.changed(field) && payment[field]) {
        payment[field] = payment[field].trim();
      }
    });

    if (payment.changed("amount")) {
      payment.amount = parseFloat(payment.amount);
    }
  });

  // Instance method to generate room id \\
  Payment.prototype.generateToken = async function () {
    const payment = this;

    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);

      result += characters.charAt(randomIndex);
    }

    payment.token = result;

    await payment.save();

    return result;
  };

  return Payment;
};
