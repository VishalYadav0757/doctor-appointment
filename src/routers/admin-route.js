const router = require("express").Router();
const multer = require("multer");
const auth = require("../middlewares/auth");
const adminController = require("../controllers/admin-controller");

// Create Admin \\
router.post("/createAdmin", adminController.createAdmin);

// Login Admin \\
router.post("/loginAdmin", adminController.loginAdmin);

// Logout Admin \\
router.post("/logoutAdmin", auth, adminController.logoutAdmin);

// Read Admin Profile \\
router.get("/readAdminProfile", auth, adminController.readAdminProfile);

// Update Admin Profile \\
router.patch("/updateAdminProfile", auth, adminController.updateAdminProfile);

// Upload Admin Profile Picture \\
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
  "/uploadAdminProfilePicture",
  auth,
  upload.single("avatar"),
  adminController.uploadAdminProfilePicture
);

// Display Admin Profile Picture \\
router.get(
  "/displayAdminProfilePicture",
  auth,
  adminController.displayAdminProfilePicture
);

// Delete Admin Profile Picture \\
router.delete(
  "/deleteAdminProfilePicture",
  auth,
  adminController.deleteAdminProfilePicture
);

// Delete Admin Profile \\
router.delete("/deleteAdminProfile", auth, adminController.deleteAdminProfile);

// Read All Doctors \\
router.get("/readAllDoctors", auth, adminController.readAllDoctors);

// Read A Doctor \\
router.get("/readDoctor/:id", auth, adminController.readDoctor);

// Delete A Doctor \\
router.delete("/deleteDoctor/:id", auth, adminController.deleteDoctor);

// Read All Users \\
router.get("/readAllUsers", auth, adminController.readAllUsers);

// Read A User \\
router.get("/readUser/:id", auth, adminController.readUser);

// Delete A User \\
router.delete("/deleteUser/:id", auth, adminController.deleteUser);

// Read All Appointments \\
router.get("/readAllAppointments", auth, adminController.readAllAppointments);

// Read All Payments \\
router.get("/readAllPayments", auth, adminController.readAllPayments);

module.exports = router;
