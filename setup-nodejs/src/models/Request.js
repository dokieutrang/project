import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    evenId: { type: String, required: true },
    status: { type: String, required: true, default: 'pending' }
},
    {
        timestamps: true,
    }
);

const Request = mongoose.model('Request', requestSchema);

export default Request;
