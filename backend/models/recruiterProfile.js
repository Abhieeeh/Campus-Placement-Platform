import mongoose from "mongoose";

const recruiterProfileSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    companyProfile: {
        companyName: {
            type: String,
            default: ''
        },
        recruiterName: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            default: ''
        },
        website: {
            type: String,
            default: ''
        },
        industry: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        companySize: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        minCgpa: {
            type: Number,
            default: 7.0
        },
        hiringBranches: {
            type: [String],
            default: ['CSE', 'IT', 'AI/DS', 'ECE']
        }
    }
}, { timestamps: true });

const RecruiterProfile = mongoose.model("RecruiterProfile", recruiterProfileSchema);

export default RecruiterProfile;
