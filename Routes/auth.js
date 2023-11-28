// Import required modules
const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { validationResult, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../Middleware/fetchuser");

const JWT_SECRET = "elwishbhaikeaagekoibolsaktaghaikya";

// ROUTE :01 Create a POST request route for user registration: "/api/auth/createuser" (NO LOGIN REQUIRED)
router.post(
   "/createuser",
   [
      // Validators for user registration form
      body("name", "Enter a Valid Name").isLength({ min: 4 }),
      body("email", "Enter a Valid Email").isEmail(),
      body("password", "Password Must be At Least 5 Characters").isLength({
         min: 5,
      }),
   ],
   async (req, res) => {
      let success = false

      // Check for validation errors, return bad request and the errors if any
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({success, errors: errors.array() });
      }

      try {
         // Check if a user with the provided email already exists
         let user = await User.findOne({ email: req.body.email });
         if (user) {
            return res
               .status(400)
               .json({ success, error: "Sorry, a user with this email already exists." });
         }
         const salt = await bcrypt.genSalt(10);
         const SecurePassword = await bcrypt.hash(req.body.password, salt);

         // Create a new user
         user = await User.create({
            name: req.body.name,
            password: SecurePassword,
            email: req.body.email,
         });
         const data = {
            user: {
               id: user.id,
            },
         };
         const AuthToken = jwt.sign(data, JWT_SECRET);

         // Respond with the created user object
         success= true
         res.json({ success , AuthToken });
      } catch (error) {
         // Log the error and respond with a server error message
         console.error( success , error.message);
         res.status(500).send("Server Error");
      }
   }
);
// ROUTE :02==Autenticate a user using : POST   "/api/auth/login"   *no login required**
router.post(
   "/login",
   [
      // Validators for user registration form
      body("email", "Enter a Valid Email").isEmail(),
      body("password", "Password Cannot Be Blank").exists({
         min: 5,
      }),
   ],
   async (req, res) => {
      let success = false

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      try {
         let user = await User.findOne({ email });
         if (!user) {
            success = false

            return res.status(400).json({ error: "Invalid Credentials" });
         }
         const ComparePassword = await bcrypt.compare(password, user.password);
         if (!ComparePassword) {
            success = false

            return res.status(400).json({ success ,error: "Invalid Credentials" });
         }
         const data = {
            user: {
               id: user.id,
            },
         };
         const AuthToken = jwt.sign(data, JWT_SECRET);

         success = true

         res.json({ success, AuthToken });
      } catch (error) {
         console.log(error.message);
         res.status(500).send("Server Error");
      }
   }
);

// ROUTE :03==get login credentials by  : POST   "/api/auth/getuser"
router.post("/getuser", fetchuser, async (req, res) => {
   try {
      userId = req.user.id;
      const user = await User.findById(userId).select("-password")
      res.send(user)
   } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
   }
});

// Export the router
module.exports = router;
