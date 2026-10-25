import express from "express";
import { loginUser, signup, verifyEmail } from "../controllers/auth.controller.mjs";

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/register', signup);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);

export default router;
