import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        index: true
    },
    jobId: {
        type: String,
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
    candidateId: {
        type: String
    },
    candidateName: {
        type: String,
        default: 'Candidate'
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
    jobTitle: {
        type: String,
        default: 'Software Engineer'
    },
    company: {
        type: String,
        default: 'Company'
    },
    status: {
        type: String,
        default: 'Shortlisted'
    },
    shortlistedDate: {
        type: String,
        default: () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

shortlistSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
shortlistSchema.set('toJSON', { virtuals: true });
shortlistSchema.set('toObject', { virtuals: true });

const Shortlist = mongoose.model("Shortlist", shortlistSchema);

export default Shortlist;
