const router = require("express").Router();
const multer = require("multer");
const auth = require("../middlewares/auth");
const doctorController = require("../controllers/doctor-controller");

// Create Doctor \\
router.post("/createDoctor", doctorController.createDoctor);

// Login Doctor \\
router.post("/loginDoctor", doctorController.loginDoctor);

// Logout Doctor \\
router.post("/logoutDoctor", auth, doctorController.logoutDoctor);

// Read Doctor Profile \\
router.get("/readDoctorProfile", auth, doctorController.readDoctorProfile);

// Update Doctor Profile \\
router.patch(
  "/updateDoctorProfile",
  auth,
  doctorController.updateDoctorProfile
);

// Upload Doctor Profile Picture \\
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
  "/uploadDoctorProfilePicture",
  auth,
  upload.single("avatar"),
  doctorController.uploadDoctorProfilePicture
);

// Display Doctor Profile Picture \\
router.get(
  "/displayDoctorProfilePicture",
  auth,
  doctorController.displayDoctorProfilePicture
);

// Delete Doctor Profile Picture \\
router.delete(
  "/deleteDoctorProfilePicture",
  auth,
  doctorController.deleteDoctorProfilePicture
);

// Delete Doctor Profile \\
router.delete(
  "/deleteDoctorProfile",
  auth,
  doctorController.deleteDoctorProfile
);

module.exports = router;
