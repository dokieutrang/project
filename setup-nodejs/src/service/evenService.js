import Even from "../models/Even";
import Request from "../models/Request";
const moment = require('moment');
import User from "../models/User";
import sendEmail from "./emailService";

const createEven = async ({ name, startTime, description, image, organizerId }) => {
    try {
        const existingEven = await Even.findOne({ name });
        if (existingEven) {
            return {
                EM: "Name already in use.",
                EC: "-1",
                DT: "",
            };
        }

        const newEven = new Even({
            name,
            startTime,
            userIds: [],
            description,
            image,
            organizerId,
            status: 'pending',
        });

        await newEven.save();
        return {
            EM: "Even created successfully!",
            EC: "0",
            DT: newEven,
        };
    } catch (error) {
        return {
            EM: "Error creating even: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const getAllEvens = async (limit, page, search, organizerId) => {
    try {
        const query = { organizerId: organizerId };
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        const totalCount = await Even.countDocuments(query);
        const evens = await Even.find(query)
            .limit(Number(limit))
            .skip(Number(limit) * (Number(page) - 1))
            .sort({ startTime: -1 });

        const currentDate = new Date();

        for (let event of evens) {
            const startTime = new Date(event.startTime);
            if (currentDate > startTime && event.status !== 'end') {
                event.status = 'end';
                await event.save();
            }
        }

        const formattedEvens = evens.map(event => ({
            ...event._doc,
            startTime: moment(event.startTime).format('DD-MM-YYYY'),
        }));
        return {
            EM: "Get all evens successfully!",
            EC: "0",
            DT: formattedEvens,
            totalCount: totalCount,
        };
    } catch (error) {
        return {
            EM: "Error Get all evens: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const deleteEven = async (id) => {
    try {
        const even = await Even.findByIdAndDelete(id);
        if (!even) {
            return {
                EM: "Even not found!",
                EC: "-1",
                DT: "",
            };
        }
        return {
            EM: "Even deleted successfully!",
            EC: "0",
            DT: even,
        };
    } catch (error) {
        return {
            EM: "Error deleting even: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const sendNotificationToUsers = async (eventId) => {
    try {
        const event = await Even.findById(eventId);
        if (!event) {
            throw new Error("Event not found!");
        }

        const userIds = event.userIds;

        if (!Array.isArray(userIds)) {
            return {
                EM: "userIds should be an array!",
                EC: "-1",
                DT: "",
            };
        }

        const users = await User.find({ '_id': { $in: userIds } });

        if (!users.length) {
            return {
                EM: "No users found for this event.",
                EC: "-1",
                DT: "",
            };
        }

        const emailPromises = users.map(async (user) => {
            const subject = "Thông báo sự kiện mới!";
            const text = `Xin chào ${user.name},\n\nSự kiện "${event.name}" sẽ diễn ra từ (${moment(event.startTime).format('DD-MM-YYYY')} bạn vui lòng thường xuyên theo dõi thư. Cảm ơn!`;
            return await sendEmail(user.email, subject, text);
        });

        await Promise.all(emailPromises);

        return {
            EM: "Emails sent successfully!",
            EC: "0",
            DT: "",
        };
    } catch (error) {
        return {
            EM: "Error sending notification: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const top10Evens = async (organizerId, sortOrder, userId) => {
    try {
        const currentDate = new Date();

        let query = { status: { $ne: 'end' } };
        if (organizerId) {
            query.organizerId = organizerId;
        }

        const allEvents = await Even.find({});
        for (let event of allEvents) {
            const startTime = new Date(event.startTime);
            if (currentDate > startTime && event.status !== 'end') {
                event.status = 'end';
                await event.save();
            }
        }

        let events = await Even.find(query);

        if (!events || events.length === 0) {
            return {
                EM: "No events found.",
                EC: "1",
                DT: [],
            };
        }

        events = events.map(event => ({
            ...event.toObject(),
            userIdsCount: event.userIds ? event.userIds.length : 0,
            requestStatus: null
        }));

        if (userId) {
            const requests = await Request.find({
                userId: userId,
                evenId: { $in: events.map(e => e._id) }
            });
            const requestMap = new Map(
                requests.map(request => [request.evenId.toString(), request.status])
            );

            events = events.map(event => ({
                ...event,
                requestStatus: requestMap.get(event._id.toString()) || null
            }));
        }

        const sort = (a, b) => {
            if (sortOrder === 'news') {
                return new Date(b.startTime) - new Date(a.startTime);
            } else if (sortOrder === 'old') {
                return new Date(a.startTime) - new Date(b.startTime);
            }
            return 0;
        };

        const sortedEvents = events.sort((a, b) => {
            const userSort = b.userIdsCount - a.userIdsCount;
            return userSort === 0 ? sort(a, b) : userSort;
        });

        const topEvents = sortedEvents.slice(0, 10);
        return {
            EM: "Get top 10 events successfully!",
            EC: "0",
            DT: topEvents,
        };
    } catch (error) {
        return {
            EM: "Error fetching events: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const getAllEvenHomePage = async (limit, page, organizerId, sortOrder, userId) => {
    try {
        const currentDate = new Date();

        let query = { status: { $in: ['pending', 'openMeet'] } };
        if (organizerId) {
            query.organizerId = organizerId;
        }

        const allEvents = await Even.find({});
        for (let event of allEvents) {
            const startTime = new Date(event.startTime);
            if (currentDate > startTime && event.status !== 'end') {
                event.status = 'end';
                await event.save();
            }
        }

        const sort = sortOrder === 'news' ? { startTime: -1 } : { startTime: 1 };

        let events = await Even.find(query)
            .sort(sort)
            .limit(Number(limit))
            .skip(Number(limit) * (Number(page) - 1));

        if (!events || events.length === 0) {
            return {
                EM: "No events found for the organizer.",
                EC: "1",
                DT: [],
                totalCount: 0,
            };
        }

        let formattedEvents = events.map(event => ({
            ...event.toObject(),
            startTime: event.startTime,
            requestStatus: null
        }));

        if (userId) {
            const requests = await Request.find({
                userId: userId,
                evenId: { $in: events.map(e => e._id) }
            });

            const requestMap = new Map(
                requests.map(request => [request.evenId.toString(), request.status])
            );

            formattedEvents = formattedEvents.map(event => ({
                ...event,
                requestStatus: requestMap.get(event._id.toString()) || null
            }));
        }

        const totalCount = await Even.countDocuments(query);

        return {
            EM: "Get all events successfully!",
            EC: "0",
            DT: formattedEvents,
            totalCount: totalCount,
        };
    } catch (error) {
        return {
            EM: "Error fetching events: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const openMeet = async (evenId, message) => {
    try {
        const even = await Even.findById(evenId);
        if (!even) {
            throw new Error("even not found!");
        }

        const users = await User.find({ _id: { $in: even.userIds } });
        if (!users || users.length === 0) {
            throw new Error("No users found for this event!");
        }

        even.status = 'openMeet';
        await even.save();

        const subject = "Link mở phòng sự kiện online";
        const emailPromises = users.map(user => {
            const text = `Xin chào ${user.name}, bạn vui lòng truy cập vào đường dẫn để tham gia sự kiện online: ${message}.`;
            return sendEmail(user.email, subject, text);
        });
        await Promise.all(emailPromises);

        return {
            success: true,
            message: "open successfully!",
            data: even,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            data: null,
        };
    }
};

export default { createEven, getAllEvens, deleteEven, sendNotificationToUsers, top10Evens, getAllEvenHomePage, openMeet };
