import mongoose from 'mongoose';

const evenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    userIds: { type: [String], default: [] },
    organizerId: { type: String, required: true },
    status: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
},
    {
        timestamps: true,
    }
);

const Even = mongoose.model('Even', evenSchema);

export default Even;
