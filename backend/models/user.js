import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role:{
        type: String,
        enum: ['student','recruiter','admin'],
        required: true,
    }

});

const user = mongoose.model('user', userSchema);
export default user;