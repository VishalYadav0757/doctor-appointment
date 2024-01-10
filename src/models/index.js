const {
  DB,
  USER,
  PASSWORD,
  HOST,
  dialect,
  pool,
} = require("../config/dbConfig");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(DB, USER, PASSWORD, {
  host: HOST,
  dialect: dialect,
  operatorsAliases: false,
  pool: { ...pool },
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected !!");
  })
  .catch((error) => {
    console.log("Error :-", error);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.admin = require("./admin-model")(sequelize, DataTypes);
db.doctors = require("./doctor-model")(sequelize, DataTypes);
db.users = require("./user-model")(sequelize, DataTypes);
db.appointments = require("./appointment-model")(sequelize, DataTypes);
db.payments = require("./payment-model")(sequelize, DataTypes);

db.doctors.hasMany(db.appointments, { foreignKey: "doctorId" });
db.appointments.belongsTo(db.doctors, { foreignKey: "doctorId" });
db.users.hasMany(db.appointments, { foreignKey: "userId" });
db.appointments.belongsTo(db.users, { foreignKey: "userId" });
db.appointments.hasOne(db.payments, { foreignKey: "appointmentId" });
db.payments.belongsTo(db.appointments, { foreignKey: "appointmentId" });

db.sequelize.sync({ force: false }).then(() => {
  console.log("Synced !!");
});

module.exports = db;
