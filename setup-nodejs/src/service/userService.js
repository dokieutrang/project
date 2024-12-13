import User from "../models/User.js";
import bcrypt from "bcrypt";
import sendEmail from "./emailService";

const register = async ({ name, email, password }) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return {
                EM: "Email already in use.",
                EC: "-1",
                DT: "",
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const otpCode = Math.floor(1000 + Math.random() * 9000);
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "customer",
            otpCode,
            otpExpiry,
            isVerified: false,
        });

        await newUser.save();

        const subject = "Xác nhận email";
        const text = `Xin chào ${newUser.name}, mã xác nhận của bạn là ${otpCode}. Mã này sẽ hết hạn sau 10 phút.`;

        await sendEmail(email, subject, text);

        return {
            EM: "User created successfully! OTP sent to email.",
            EC: "0",
            DT: "",
        };
    } catch (error) {
        return {
            EM: "Error creating user: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const verifyEmail = async ({ email, otpCode }) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return {
                EM: "User not found.",
                EC: "-1",
                DT: "",
            };
        }

        if (user.isVerified) {
            return {
                EM: "User already verified.",
                EC: "0",
                DT: "",
            };
        }

        if (user.otpCode !== otpCode || user.otpExpiry < Date.now()) {
            return {
                EM: "Invalid or expired OTP.",
                EC: "-1",
                DT: "",
            };
        }

        user.isVerified = true;
        user.otpCode = null;
        user.otpExpiry = null;
        await user.save();

        return {
            EM: "Email verified successfully!",
            EC: "0",
            DT: "",
        };
    } catch (error) {
        return {
            EM: "Error verifying email: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const createUser = async ({ name, email, password, role }) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return {
                EM: "Email already in use.",
                EC: "-1",
                DT: "",
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            role,
            password: hashedPassword,
        });

        await newUser.save();
        return {
            EM: "User created successfully!",
            EC: "0",
            DT: newUser,
        };
    } catch (error) {
        return {
            EM: "Error creating user: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const getAllUsers = async (limit, page, search) => {
    try {
        const query = {};
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        const totalCount = await User.countDocuments(query);
        const users = await User.find(query)
            .limit(Number(limit))
            .skip(Number(limit) * (Number(page) - 1))
            .sort({ startTime: -1 });
        return {
            EM: "Get all users successfully!",
            EC: "0",
            DT: users,
            totalCount: totalCount,
        };
    } catch (error) {
        return {
            EM: "Error Get all users: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const updateUser = async (id, userData) => {
    try {
        const user = await User.findByIdAndUpdate(id, userData, { new: true });
        if (!user) {
            return {
                EM: "User not found!",
                EC: "-1",
                DT: "",
            };
        }
        return {
            EM: "User updated successfully!",
            EC: "0",
            DT: user,
        };
    } catch (error) {
        return {
            EM: "Error updating user: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const deleteUser = async (id) => {
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return {
                EM: "User not found!",
                EC: "-1",
                DT: "",
            };
        }
        return {
            EM: "User deleted successfully!",
            EC: "0",
            DT: user,
        };
    } catch (error) {
        return {
            EM: "Error deleting user: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const getRoleOrganizer = async () => {
    try {
        const query = { role: 'organizer' };
        const users = await User.find(query)
            .sort({ startTime: -1 });
        return {
            EM: "getRoleOrganizer successfully!",
            EC: "0",
            DT: users,
        };
    } catch (error) {
        return {
            EM: "Error getRoleOrganizer: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

export default { createUser, getAllUsers, updateUser, deleteUser, register, verifyEmail, getRoleOrganizer };
