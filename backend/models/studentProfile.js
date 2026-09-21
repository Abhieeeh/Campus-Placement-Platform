import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    personalInfo: {
        name: String,
        dept: String,
        email: String,
        phone: String,
        github: String,
        linkedin: String
    },
    academicInfo: {
        branch: String,
        cgpa: String,
        graduationYear: String,
        backlogs: String
    },
    skills: {
        type: [String],
        default: []
    },
    projects: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    resume: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, { timestamps: true });

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;