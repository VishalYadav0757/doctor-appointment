const jwt = require("jsonwebtoken");
const db = require("../models");

const Admin = db.admin;
const Doctor = db.doctors;
const User = db.users;

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;

    if (decoded.userType === "user") {
      user = await User.findOne({ where: { id: decoded.id } });

      if (!user) {
        throw new Error("User not found !!");
      }

      req.user = user;
    } else if (decoded.userType === "doctor") {
      user = await Doctor.findOne({ where: { id: decoded.id } });

      if (!user) {
        throw new Error("User not found !!");
      }

      req.doctor = user;
    } else if (decoded.userType === "admin") {
      user = await Admin.findOne({ where: { id: decoded.id } });

      if (!user) {
        throw new Error("User not found !!");
      }

      req.admin = user;
    } else {
      throw new Error("Invalid User Type !!");
    }

    const userTokens = JSON.parse(user.tokens);

    const tokenExists = userTokens.some(
      (userToken) => userToken.token === token
    );

    if (!tokenExists) {
      throw new Error();
    }

    req.token = token;

    next();
  } catch (e) {
    res.status(400).send("Please authenticate !!");
  }
};

module.exports = auth;
