import user from "../models/user.js";
import StudentProfile from "../models/studentProfile.js";
import RecruiterProfile from "../models/recruiterProfile.js";
import jwt from "jsonwebtoken";

function generateToken(userId, role) {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '7d' }
    );
}

export const loginUser = async (req, res) => {
    try {
        const { email, role, password } = req.body;
        const cleanEmail = (email || '').trim();

        if (!cleanEmail || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const foundUser = await user.findOne({
            $or: [
                { email: cleanEmail },
                { email: cleanEmail.toLowerCase() },
                { email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') } }
            ]
        });

        if (!foundUser) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (foundUser.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (role && foundUser.role.toLowerCase() !== role.toLowerCase()) {
            return res.status(401).json({ message: `This account is registered as a ${foundUser.role}, not a ${role}` });
        }

        const token = generateToken(foundUser._id, foundUser.role);

        let profile = null;
        if (foundUser.role === 'student') {
            profile = await StudentProfile.findOne({
                $or: [
                    { email: foundUser.email },
                    { userId: foundUser._id }
                ]
            });
        } else if (foundUser.role === 'recruiter') {
            const recDoc = await RecruiterProfile.findOne({
                $or: [
                    { email: foundUser.email },
                    { userId: foundUser._id }
                ]
            });
            profile = recDoc ? (recDoc.companyProfile || recDoc) : null;
        }

        res.status(200).json({
            message: `User logged in successfully as ${foundUser.role}`,
            token,
            user: { _id: foundUser._id, id: foundUser._id.toString(), email: foundUser.email, role: foundUser.role },
            profile
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Internal server error during login" });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { email, role, password } = req.body;

        const existingUser = await user.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered, please login instead" });
        }

        const newUser = await user.create({ email, role, password });
        if (!newUser) {
            return res.status(500).json({ message: "Failed to register user" });
        }
        res.status(201).json({
            token: generateToken(newUser._id, newUser.role),
            message: `User registered successfully as ${role}`,
            user: { _id: newUser._id, id: newUser._id.toString(), email, role }
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal server error during registration" });
    }
};

export const saveStudentProfile = async (req, res) => {
    try {
        const { email, personalInfo, academicInfo, skills, projects, resume } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required to save profile" });
        }

        const foundUser = await user.findOne({ email });
        const userId = foundUser?._id;

        const updatedProfile = await StudentProfile.findOneAndUpdate(
            { email },
            {
                email,
                ...(userId && { userId }),
                personalInfo,
                academicInfo,
                skills,
                projects,
                ...(resume && { resume })
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Student profile saved successfully in studentprofile collection',
            data: updatedProfile
        });
    } catch (error) {
        console.error("Error saving student profile:", error);
        res.status(500).json({ error: "Internal server error saving student profile" });
    }
};

export const getStudentProfile = async (req, res) => {
    try {
        const email = req.body?.email || req.query?.email || req.params?.email;
        if (!email) {
            return res.status(400).json({ message: "Email is required to fetch profile" });
        }
        const profile = await StudentProfile.findOne({ email });
        if (!profile) {
            return res.status(404).json({ message: "Student profile not found" });
        }
        res.status(200).json({ success: true, profile });
    } catch (error) {
        console.error("Error fetching student profile:", error);
        res.status(500).json({ error: "Internal server error fetching student profile" });
    }
};

export const saveRecruiterProfile = async (req, res) => {
    try {
        const { email, companyProfile } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required to save recruiter profile" });
        }

        const foundUser = await user.findOne({ email });
        const userId = foundUser?._id;

        const updatedProfile = await RecruiterProfile.findOneAndUpdate(
            { email },
            {
                email,
                ...(userId && { userId }),
                companyProfile
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Recruiter company profile saved successfully in recruiterprofile collection',
            data: updatedProfile
        });
    } catch (error) {
        console.error("Error saving recruiter profile:", error);
        res.status(500).json({ error: "Internal server error saving recruiter profile" });
    }
};

export const getRecruiterProfile = async (req, res) => {
    try {
        const email = req.body?.email || req.query?.email || req.params?.email;
        if (!email) {
            return res.status(400).json({ message: "Email is required to fetch profile" });
        }
        const profile = await RecruiterProfile.findOne({ email });
        if (!profile) {
            return res.status(404).json({ message: "Recruiter profile not found" });
        }
        res.status(200).json({
            success: true,
            profile: profile.companyProfile || profile
        });
    } catch (error) {
        console.error("Error fetching recruiter profile:", error);
        res.status(500).json({ error: "Internal server error fetching recruiter profile" });
    }
};