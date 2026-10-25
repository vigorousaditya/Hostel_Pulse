import bcrypt from "bcryptjs"
import userData from "../models/userData.mjs"
import OTP from "../models/otp.mjs";
import {sendOtp} from "../utils/sendOtp.mjs";
import jwt from "jsonwebtoken"

export const signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role } = req.body;
        
        console.log("STEP 2: body parsed");
        const normalizedEmail = email.toLowerCase().trim();
        console.log("STEP 3: email normalized");
        const existingUser = await userData.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password doesn't match !" });
        }
        console.log("STEP 4: checked existing user");
        const hashPassword = await bcrypt.hash(password, 10);
        console.log("STEP 5: password hashed");
        await userData.create({
            name,
            email: normalizedEmail,
            passwordHash: hashPassword,
            role: role,
            status: "Pending"
        });

        console.log("STEP 6: user created");

        await OTP.deleteMany({ email: normalizedEmail });
        console.log("STEP 7: old OTP deleted");
        const otp = await sendOtp(normalizedEmail);
        console.log("STEP 8: sendOtp called", otp);
        const otpHash = await bcrypt.hash(otp, 10);
        await OTP.create({
            email: normalizedEmail,
            otpHash: otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        
        res.status(201).json({ message: "Signup successful. Please verify your email." });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const otpRecord = await OTP.findOne({ email: normalizedEmail });
        if (!otpRecord) {
            return res.status(400).json({ message: "No OTP found. Please signup again." });
        }
        if (otpRecord.expiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired. Please request a new one" });
        }
        const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        await userData.updateOne({ email: normalizedEmail }, { $set: { isEmailVerified: true } });
        await OTP.deleteOne({ email: normalizedEmail });
        res.status(200).json({ message: "Email Verified Successfully!" });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const loginUser = async (req, res) => {  
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const userRecord = await userData.findOne({ email: normalizedEmail });
        if (!userRecord) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!userRecord.isEmailVerified) {
            return res.status(403).json({ message: "Your email is not verified" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, userRecord.passwordHash);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect password" });
        }
        const token = jwt.sign(
            {
                id: userRecord._id,
                email: userRecord.email,
                role: userRecord.role,
            },  
            process.env.JWT_SECRET,
            { expiresIn: "12hr" }
        );

        res.status(200).json({ 
            message: "Login successful",
            token,
            user: { name: userRecord.name, email: userRecord.email, role: userRecord.role, status: userRecord.status } 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
