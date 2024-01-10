const router = require("express").Router();
const multer = require("multer");
const auth = require("../middlewares/auth");
const userController = require("../controllers/user-controller");

// Create User \\
router.post("/createUser", userController.createUser);

// Login User \\
router.post("/loginUser", userController.loginUser);

// Logout User \\
router.post("/logoutUser", auth, userController.logoutUser);

// Read User Profile \\
router.get("/readUserProfile", auth, userController.readUserProfile);

// Update User Profile \\
router.patch("/updateUserProfile", auth, userController.updateUserProfile);

// Upload User Profile Picture \\
const upload = multer({
  limits: {
    fileSize: 1000000,
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image file !!"));
    }

    cb(undefined, true);
  },
});

router.post(
  "/uploadUserProfilePicture",
  auth,
  upload.single("avatar"),
  userController.uploadUserProfilePicture
);

// Display User Profile Picture \\
router.get(
  "/displayUserProfilePicture",
  auth,
  userController.displayUserProfilePicture
);

// Delete User Profile Picture \\
router.delete(
  "/deleteUserProfilePicture",
  auth,
  userController.deleteUserProfilePicture
);

// Delete User Profile \\
router.delete("/deleteUserProfile", auth, userController.deleteUserProfile);

module.exports = router;
