import Request from "../models/Request";
import Even from "../models/Even";
import User from "../models/User";

const createRequest = async ({ userId, evenId }) => {
    try {
        const newReuqest = new Request({
            userId,
            evenId,
            status: 'pending',
        });

        await newReuqest.save();
        return {
            EM: "createRequest successfully",
            EC: "0",
            DT: newReuqest,
        };
    } catch (error) {
        return {
            EM: "Error createRequest: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const getAllRequestByOrganizerId = async (limit, page, search, organizerId) => {
    try {
        limit = parseInt(limit);
        page = parseInt(page);
        const skip = (page - 1) * limit;

        const events = await Even.find({ organizerId: organizerId });
        if (!events || events.length === 0) {
            return {
                EM: "Không tìm thấy sự kiện nào của tổ chức này",
                EC: "1",
                DT: [],
                totalCount: 0
            };
        }

        const eventIds = events.map(event => event._id);

        let requestQuery = { evenId: { $in: eventIds }, status: "pending" };

        if (search) {
            const users = await User.find({
                name: { $regex: search, $options: "i" }
            });
            const userIds = users.map(user => user._id);

            const searchedEvents = await Even.find({
                name: { $regex: search, $options: "i" }
            });
            const searchedEventIds = searchedEvents.map(event => event._id);

            requestQuery = {
                evenId: { $in: eventIds },
                $or: [
                    { userId: { $in: userIds } },
                    { evenId: { $in: searchedEventIds } },
                    { status: { $regex: search, $options: "i" } }
                ]
            };
        }

        const totalCount = await Request.countDocuments(requestQuery);

        const requests = await Request.find(requestQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const formattedRequests = [];
        for (let request of requests) {
            const event = await Even.findById(request.evenId);
            const user = await User.findById(request.userId);

            formattedRequests.push({
                _id: request._id,
                status: request.status,
                createdAt: request.createdAt,
                event: {
                    _id: event._id,
                    name: event.name
                },
                user: {
                    _id: user._id,
                    name: user.name
                }
            });
        }

        return {
            EM: "Lấy danh sách yêu cầu thành công!",
            EC: "0",
            DT: formattedRequests,
            totalCount: totalCount
        };

    } catch (error) {
        console.error("getAllRequestByOrganizerId service error:", error);
        return {
            EM: "Đã xảy ra lỗi khi lấy danh sách yêu cầu.",
            EC: "-1",
            DT: [],
            totalCount: 0
        };
    }
};

export default { createRequest, getAllRequestByOrganizerId };

