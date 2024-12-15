const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");

// Register a new user
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, preferences } = req.body;
        
        console.log('Registration request body:', {
            name,
            email,
            preferences
        });

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Only set admin true for specific email
        const isAdminUser = false; 
      //  const isAdminUser = email === "spencerokine@gmail.com"; 

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            preferences: preferences || [],
            isAdmin: isAdminUser // Will be false for all emails except admintest@test.com
        });

        console.log('About to save user with isAdmin:', newUser.isAdmin);

        await newUser.save();
        
        const savedUser = await User.findOne({ email }).lean();
        console.log('Saved user:', {
            email: savedUser.email,
            isAdmin: savedUser.isAdmin
        });

        // Create sanitized response
        const userResponse = {
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            preferences: savedUser.preferences,
            isAdmin: savedUser.isAdmin
        };

        res.status(201).json({ 
            message: "User registered successfully!",
            user: userResponse
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Login user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                isAdmin: user.isAdmin 
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ 
            message: "Login successful!", 
            user,
            token 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET user details
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Ensure default values
        if (!user.preferences) user.preferences = [];

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Update user preferences
router.patch("/:userId/preferences", async (req, res) => {
    try {
        const { userId } = req.params;
        const { preferences } = req.body;

        if (!preferences) {
            return res.status(400).json({ message: "Preferences are required." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.preferences = preferences;
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        console.error("Error updating preferences:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Example of an admin-only route
router.get("/admin/users", verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// Another example for admin-only operations
router.delete("/admin/user/:userId", verifyAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
});

module.exports = router;
