import contactService from "../service/contactService";

const createContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const data = await contactService.createContact({ name, email, message });
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

const getAllContact = async (req, res) => {
    try {
        const { limit = 10, page = 1, search = "" } = req.query;
        const data = await contactService.getAllContact(limit, page, search);
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
            EM: "Get all contact error" + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const confirmContact = async (req, res) => {
    const { requestId } = req.body;
    try {
        const result = await contactService.confirmContact(requestId);
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
            EM: "Confirm request error: " + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const feedback = async (req, res) => {
    const { contactId , message} = req.body;
    try {
        const result = await contactService.feedback(contactId, message);
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
            EM: "Feedback request error: " + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

export default { createContact, getAllContact, confirmContact, feedback };