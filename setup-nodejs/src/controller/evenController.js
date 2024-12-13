import evenService from "../service/evenService";

const createEven = async (req, res) => {
    try {
        const { name, startTime, description, image, organizerId } = req.body;

        if (!name || !startTime || !image || !organizerId) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const data = await evenService.createEven({ name, startTime, description, image, organizerId });
        res.status(201).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        res.status(500).json({
            EM: "Create even error" + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const getAllEvens = async (req, res) => {
    try {
        const { limit = 10, page = 1, search = "", organizerId } = req.query;
        const data = await evenService.getAllEvens(limit, page, search, organizerId);
        const totalPages = Math.ceil(data.totalCount / limit);
        res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
            total: data.totalCount,
            page: Number(page),
            limit: Number(limit),
            totalPages,
        });
    } catch (error) {
        res.status(500).json({
            EM: "Get all even error" + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const deleteEven = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await evenService.deleteEven(id);

        if (data.EC === "0") {
            res.status(200).json({
                EM: data.EM,
                EC: data.EC,
                DT: data.DT,
            });
        } else {
            res.status(400).json({
                EM: data.EM,
                EC: data.EC,
                DT: data.DT,
            });
        }
    } catch (error) {
        res.status(500).json({
            EM: "Delete user error: " + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const notification = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await evenService.sendNotificationToUsers(id);

        if (data.EC === "0") {
            res.status(200).json({
                EM: data.EM,
                EC: data.EC,
                DT: "",
            });
        } else {
            res.status(400).json({
                EM: data.EM,
                EC: data.EC,
                DT: "",
            });
        }
    } catch (error) {
        res.status(500).json({
            EM: "Notification error: " + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const top10Evens = async (req, res) => {
    try {
        const { organizerId, sortOrder = 'news', userId } = req.query;
        const data = await evenService.top10Evens(organizerId, sortOrder, userId);

        res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        res.status(500).json({
            EM: "Get top10Evens error" + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const getAllEvenHomePage = async (req, res) => {
    try {
        const { limit = 10, page = 1, organizerId, sortOrder = 'news', userId } = req.query;
        const data = await evenService.getAllEvenHomePage(limit, page, organizerId, sortOrder, userId);
        const totalPages = Math.ceil(data.totalCount / limit);
        const currentPage = Number(page);
        res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
            totalRecords: data.totalCount,
            totalPages: totalPages,
            currentPage: currentPage,
            limit: Number(limit),
        });
    } catch (error) {
        res.status(500).json({
            EM: "Get getAllEvenHomePage error" + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const openMeet = async (req, res) => {
    const { evenId, message } = req.body;
    try {
        const result = await evenService.openMeet(evenId, message);
        if (result.success) {
            return res.status(200).json({
                EM: result.message,
                EC: "0",
                DT: result.data,
            });
        } else {
            return res.status(400).json({
                EM: result.message,
                EC: "-1",
                DT: "",
            });
        }
    } catch (error) {
        return res.status(500).json({
            EM: "open meeting error: " + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

export default { createEven, getAllEvens, deleteEven, notification, top10Evens, getAllEvenHomePage, openMeet };
