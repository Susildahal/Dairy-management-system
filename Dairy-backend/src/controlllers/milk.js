import Milk from "../models/milk.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import User from "../models/user.js";
import transporter from "../config/nodemiller.js"
export const updatemilk = async (req, resp, next) => {
    const { id } = req.params;
    const { userid, name, todaymilk, todaymoney, todayfit, session } = req.body;

    try {
        // Validate required fields
        if (!userid || !name || todaymilk === undefined || todaymoney === undefined || todayfit === undefined || !session) {
            return resp.status(400).json({
                success: false,
                message: "Missing required fields: userid, name, todaymilk, todaymoney, todayfit, session"
            });
        }

        // Find existing milk record
        const existingMilk = await Milk.findById(id);
        if (!existingMilk) {
            return resp.status(404).json({
                success: false,
                message: "Milk data not found"
            });
        }
       // block if permission is false 
       if (existingMilk.permission === false) {
            return resp.status(400).json({
                success: false,
                message: "Ask user for permission to update this record"
            });
        }
        // Parse numeric values
        const milkAmount = parseFloat(todaymilk) || 0;
        const moneyAmount = parseFloat(todaymoney) || 0;
        const fitAmount = parseFloat(todayfit) || 0;

        if (milkAmount < 0 || moneyAmount < 0 || fitAmount < 0) {
            return resp.status(400).json({
                success: false,
                message: "Milk, money, and fit values must be non-negative numbers"
            });
        }

        // Find user by userid or _id
        let user = await User.findOne({ userid: userid });
        if (!user && mongoose.Types.ObjectId.isValid(userid)) {
            user = await User.findById(userid);
        }

        if (!user) {
            return resp.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update user's last entry
        const lastUpdatePayload = {
            lastUpdateAt: new Date(),
            lastUpdateDisplay: new Date().toLocaleString(),
            lastEntry: {
                name,
                todaymilk: milkAmount,
                todaymoney: moneyAmount,
                todayfit: fitAmount,
                session: session,
                permission:false
            }
        };

        let updatedUser = await User.findOneAndUpdate(
            { userid: userid },
            { $set: lastUpdatePayload },
            { new: true }
        );

        if (!updatedUser && mongoose.Types.ObjectId.isValid(userid)) {
            updatedUser = await User.findByIdAndUpdate(
                userid,
                { $set: lastUpdatePayload },
                { new: true }
            );
        }

        // Update milk record
        existingMilk.userid = userid;
        existingMilk.name = name;
        existingMilk.todaymilk = milkAmount;
        existingMilk.todaymoney = moneyAmount;
        existingMilk.todayfit = fitAmount;
        existingMilk.session = session;
        existingMilk.permission=false;
        // Keep the same monthid
        await existingMilk.save();

        return resp.status(200).json({
            success: true,
            message: "Milk data updated successfully",
            data: existingMilk
        });

    } catch (error) {
        console.error("Error updating milk data:", error);
        next(error);
    }
};


export const allmilk = async (req, resp) => {
    const { session, monthid, userid, page, limit, startDate, endDate, date } = req.query;

    try {
        // Pagination setup
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 1000; // default 1000 for milk page
        const skip = (pageNumber - 1) * limitNumber;

        // Build filter object
        const filter = {};
        if (session) filter.session = session;
        if (monthid) filter.monthid = monthid;
        if (userid) filter.userid = userid;

        // ── Date filtering via the stored `date` field ────────────────────
        // Normalise separators to "/" (records are stored as "YYYY/MM/DD")
        const normalise = (d) => d && d.replace(/-/g, '/');

        if (date) {
            // Single date filter
            filter.date = normalise(date);
        } else if (startDate || endDate) {
            // Range filter — works even if only one end is provided
            const start = normalise(startDate);
            const end = normalise(endDate);
            if (start && end && start === end) {
                filter.date = start;               // exact day — no $gte/$lte needed
            } else {
                filter.date = {};
                if (start) filter.date.$gte = start;
                if (end) filter.date.$lte = end;
            }
        }
        // ─────────────────────────────────────────────────────────────────

        // Restriction: Admins should only see milk entries for their own users
        if (req.user.role === 'admin') {
            const adminUsers = await User.find({ adminId: req.user.userId }).select('_id');
            const adminUserIds = adminUsers.map(u => u._id.toString());

            if (filter.userid) {
                if (!adminUserIds.includes(filter.userid)) {
                    return resp.status(StatusCodes.OK).json({
                        success: true,
                        count: 0,
                        pagination: {
                            currentPage: pageNumber,
                            totalPages: 0,
                            totalItems: 0,
                            itemsPerPage: limitNumber
                        },
                        data: []
                    });
                }
            } else {
                filter.userid = { $in: adminUserIds };
            }
        }

        // Get total count for pagination metadata
        const totalCount = await Milk.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limitNumber) || 1;

        // Get paginated data — sort by date desc then name asc
        const milkData = await Milk.find(filter)
            // .sort({ date: -1, name: 1 })
            .skip(skip)
            .limit(limitNumber);

        const pagination = {
            currentPage: pageNumber,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limitNumber,
            hasNextPage: pageNumber < totalPages,
            hasPrevPage: pageNumber > 1,
            nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
            prevPage: pageNumber > 1 ? pageNumber - 1 : null
        };

        resp.status(200).json({
            success: true,
            count: milkData.length,
            pagination,
            data: milkData
        });

    } catch (error) {
        console.error("Error getting all milk data:", error);
        resp.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Server error"
        });
    }
}



export const delatemilk = async (req, resp) => {
    const { id } = req.params;
    try {
        const deletedMilk = await Milk.findByIdAndDelete(id);
        if (!deletedMilk) {
            return resp.status(404).json({
                success: false,
                message: "Milk data not found"
            });
        }
        resp.status(200).json({
            success: true,
            message: "Milk data deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting milk data:", error);
        resp.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Server error"
        });
    }
}


 export const requestpermission = async (req, resp) => {
    const {id} = req.params;

    const milkEntry = await Milk.findById(id);
    if (!milkEntry) {
        return resp.status(404).json({
            success: false,
            message: "Milk entry not found"
        });
    }

     const finduseremail = await User.findById(milkEntry.userid);
     console.log( "users",finduseremail);
     console.log( "milkEntry",milkEntry);
     console.log( "finduseremail",finduseremail.email);
     console.log( "EMAIL_USER from dot env",process.env.SMTP_USER);
    // Send permission request email
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: finduseremail.email,
            subject: "Permission Request for Milk Data",
            text: `You have requested permission to update milk data for ${milkEntry.date}. with the milk of ${milkEntry.todaymilk} liters and the fit of ${milkEntry.todayfit}%. Please confirm your request.`
        });
        resp.status(200).json({
            success: true,
            message: "Permission request sent successfully"
        });
    } catch (error) {
        console.error("Error sending permission request:", error);
        resp.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to send permission request"
        });
    }
}