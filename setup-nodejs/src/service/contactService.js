import Contact from "../models/Contact";
import Even from "../models/Even";
import Request from "../models/Request";
import User from "../models/User";
import sendEmail from "./emailService";

const createContact = async ({ name, email, message }) => {
    try {
        const newContact = new Contact({
            name,
            email,
            message,
            status: 'pending',
        });

        await newContact.save();
        return {
            EM: "Contact created successfully!",
            EC: "0",
            DT: newContact,
        };
    } catch (error) {
        return {
            EM: "Error creating Contact: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const getAllContact = async (limit, page, search) => {
    try {
        const query = { status: "pending" };
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const totalCount = await Contact.countDocuments(query);

        const contacts = await Contact.find(query)
            .limit(Number(limit))
            .skip(Number(limit) * (Number(page) - 1));

        return {
            EM: "Get all contacts successfully!",
            EC: "0",
            DT: contacts,
            totalCount: totalCount,
        };
    } catch (error) {
        return {
            EM: "Error Get all contacts: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const confirmContact = async (requestId) => {
    try {
        const contact = await Request.findById(requestId);
        if (!contact) {
            throw new Error("Contact not found!");
        }

        contact.status = 'confirmed';
        await contact.save();

        const eventId = contact.evenId;

        const event = await Even.findById(eventId);
        if (!event) {
            throw new Error("Event not found!");
        }

        const user = await User.findOne({ _id: contact.userId });
        if (!user) {
            throw new Error("User not found!");
        }

        event.userIds.push(user._id);
        await event.save();

        const subject = "Xác nhận yêu cầu";
        const text = `Xin chào ${user.name}, bạn nhận được email này khi đã được xác nhận yêu cầu vào sự kiện thành công.`;
        await sendEmail(user.email, subject, text);

        return {
            success: true,
            message: "Request confirmed and email sent successfully!",
            data: contact,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            data: null,
        };
    }
};

const feedback = async (contactId, message) => {
    try {
        const contact = await Contact.findById(contactId);
        if (!contact) {
            throw new Error("Contact not found!");
        }

        contact.status = 'confirmed';
        await contact.save();

        const subject = "Phản hồi liên hệ";
        const text = `Xin chào ${contact.name}, phản hồi liên hệ của bạn: ${message}.`;
        await sendEmail(contact.email, subject, text);

        return {
            success: true,
            message: "Feedback successfully!",
            data: contact,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            data: null,
        };
    }
};

export default { createContact, getAllContact, confirmContact, feedback };