import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    jobId: {
        type: String,
        index: true
    },
    applicationId: {
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
    jobTitle: {
        type: String,
        default: 'Software Engineer'
    },
    company: {
        type: String,
        default: 'Company'
    },
    round: {
        type: String,
        default: 'Technical Round 1'
    },
    date: {
        type: String,
        default: ''
    },
    time: {
        type: String,
        default: ''
    },
    meetingLink: {
        type: String,
        default: ''
    },
    interviewer: {
        type: String,
        default: 'Recruiter Admin'
    },
    status: {
        type: String,
        default: 'scheduled' // 'scheduled' | 'completed' | 'cancelled'
    },
    score: {
        type: Number,
        default: 0
    },
    feedback: {
        type: String,
        default: ''
    }
}, { timestamps: true });

interviewSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
interviewSchema.set('toJSON', { virtuals: true });
interviewSchema.set('toObject', { virtuals: true });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
