import requestService from "../service/requestService";
import User from "../models/User";
import Even from "../models/Even";
import Contact from "../models/Contact";

const createRequest = async (req, res) => {
    try {
        const { userId, evenId } = req.body;

        if (!userId || !evenId) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const data = await requestService.createRequest({ userId, evenId });
        res.status(201).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        res.status(500).json({
            EM: "Create createRequest error" + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const getAllRequestByOrganizerId = async (req, res) => {
    try {
        const { limit = 10, page = 1, search = "", organizerId } = req.query;
        const data = await requestService.getAllRequestByOrganizerId(limit, page, search, organizerId);
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
            EM: "getAllRequestByOrganizerId error" + error.message,
            EC: "-1",
            DT: "",
        });
    }
};



export default { createRequest, getAllRequestByOrganizerId };
