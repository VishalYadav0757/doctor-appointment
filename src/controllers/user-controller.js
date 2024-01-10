const sharp = require("sharp");
const db = require("../models");

// Create main model \\
const User = db.users;

// Create User \\
const createUser = async (req, res) => {
  let info = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    height: req.body.height,
    weight: req.body.weight,
  };

  try {
    const user = await User.create(info);

    await user.calculateBMI(req.body.height, req.body.weight);

    const token = await user.generateAuthToken();

    await user.save();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
};

// Login User \\
const loginUser = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send({ error: "Oops, Something went wrong !!" });
  }
};

// Logout User \\
const logoutUser = async (req, res) => {
  try {
    const userTokens = JSON.parse(req.user.tokens);

    req.user.tokens = JSON.stringify(
      userTokens.filter((tokenObj) => tokenObj.token !== req.token)
    );

    await req.user.save();

    res.status(200).send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Read User Profile \\
const readUserProfile = async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Update User Profile \\
const updateUserProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "height", "weight"];
  const isValid = updates.every((item) => allowedUpdates.includes(item));

  if (!updates?.length > 0 || !isValid) {
    return res.status(400).send({ error: "Not a valid property to update !!" });
  }

  try {
    const user = req.user;

    updates.forEach((item) => (user[item] = req.body[item]));

    if (updates.includes("height") || updates.includes("weight")) {
      await user.calculateBMI(user.height, user.weight);

      await user.save();
    } else {
      await user.save();
    }

    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Upload User Profile Picture \\
const uploadUserProfilePicture = async (req, res) => {
  try {
    if (!req?.file?.buffer) {
      return res.status(404).send({ error: "Please select an image file!!" });
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;

    await req.user.save();

    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Display User Profile Picture \\
const displayUserProfilePicture = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user || !user.avatar) {
      throw new Error("Oops, Something went wrong !!");
    }

    res.set("Content-Type", "image/png");

    res.status(200).send(user.avatar);
  } catch (e) {
    res.status(404).send({ error: "Oops, Something went wrong !!" });
  }
};

// Delete User Profile Picture \\
const deleteUserProfilePicture = async (req, res) => {
  try {
    req.user.avatar = null;

    await req.user.save();

    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Delete User Profile \\
const deleteUserProfile = async (req, res) => {
  try {
    await req.user.destroy();

    res.status(200).send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  createUser,
  loginUser,
  logoutUser,
  readUserProfile,
  updateUserProfile,
  uploadUserProfilePicture,
  displayUserProfilePicture,
  deleteUserProfilePicture,
  deleteUserProfile,
};
