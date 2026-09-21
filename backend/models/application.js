import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: true,
        index: true
    },
    recruiterEmail: {
        type: String,
        required: true,
        index: true
    },
    studentEmail: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        default: 'Software Engineer'
    },
    jobTitle: {
        type: String,
        default: 'Software Engineer'
    },
    company: {
        type: String,
        default: 'Company'
    },
    color: {
        type: String,
        default: 'linear-gradient(135deg, #0d9488, #059669)'
    },
    location: {
        type: String,
        default: 'India'
    },
    type: {
        type: String,
        default: 'Full-time'
    },
    salary: {
        type: String,
        default: 'Competitive'
    },
    appliedDate: {
        type: String,
        default: () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    },
    appliedTimestamp: {
        type: Number,
        default: () => Date.now()
    },
    status: {
        type: String,
        default: 'New' // 'New' | 'Shortlisted' | 'Interview' | 'Offered' | 'Rejected'
    },
    candidateId: {
        type: String
    },
    candidateName: {
        type: String,
        default: 'Student Candidate'
    },
    candidateEmail: {
        type: String
    },
    candidateBranch: {
        type: String,
        default: 'CSE'
    },
    candidateCgpa: {
        type: Number,
        default: 0
    },
    candidateSkills: {
        type: [String],
        default: []
    },
    candidateResume: {
        type: String,
        default: 'Resume.pdf'
    },
    candidatePhone: {
        type: String,
        default: ''
    },
    isSaved: {
        type: Boolean,
        default: false
    },
    stage: {
        type: Number,
        default: 1
    },
    note: {
        type: String,
        default: ''
    }
}, { timestamps: true });

applicationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
