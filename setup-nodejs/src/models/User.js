import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false, default: "" },
    role: { type: String, required: true, default: 'customer' },
    avatar: { type: String, required: false, default: "" },
    isVerified: { type: Boolean, required: true, default: false },
    otpCode: { type: String, required: false, default: null },
    otpExpiry: { type: Date, required: false, default: null },
},
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

export default User;
