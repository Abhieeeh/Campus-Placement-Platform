import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    recruiterEmail: {
        type: String,
        required: true,
        index: true
    },
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    type: {
        type: String,
        default: 'Full-time'
    },
    location: {
        type: String,
        default: 'Bengaluru, India'
    },
    salary: {
        type: String,
        default: 'Competitive'
    },
    deadline: {
        type: String,
        default: 'Open'
    },
    minCgpa: {
        type: Number,
        default: 0
    },
    maxBacklogs: {
        type: Number,
        default: 0
    },
    branches: {
        type: [String],
        default: ['All Branches']
    },
    skills: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        default: ''
    },
    responsibilities: {
        type: [String],
        default: []
    },
    qualifications: {
        type: [String],
        default: []
    },
    criteria: {
        minCgpa: { type: Number, default: 0 },
        maxBacklogs: { type: Number, default: 0 },
        eligibleBranches: { type: [String], default: ['All Branches'] },
        graduationYear: { type: String, default: '2027' }
    },
    color: {
        type: String,
        default: 'linear-gradient(135deg, #0d9488, #059669)'
    },
    status: {
        type: String,
        default: 'Active'
    },
    postedDate: {
        type: String,
        default: 'Just now'
    }
}, { timestamps: true });

jobSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

const Job = mongoose.model("Job", jobSchema);

export default Job;
