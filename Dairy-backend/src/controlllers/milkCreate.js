import Milk from "../models/milk.js";
import User from "../models/user.js";
import Month from "../models/month.js";

/**
 * POST /milk/create-records
 * Manually create empty milk records for selected users on a given date and session.
 * Replaces the nightly cron job with admin-triggered record creation.
 *
 * Body:
 *   userIds: string[]   — MongoDB _id of users to create records for
 *   date: string        — Nepali date string "YYYY-MM-DD"
 *   session: 'morning' | 'night'
 */
export const createMilkRecords = async (req, res, next) => {
  try {
    const { userIds, date, session } = req.body;

    // --- Validation ---
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds must be a non-empty array",
      });
    }

    if (!date || typeof date !== "string" || !/^\d{4}[-\/]\d{2}[-\/]\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "date is required and must be in YYYY-MM-DD or YYYY/MM/DD format",
      });
    }

    if (!session || !["morning", "night"].includes(session)) {
      return res.status(400).json({
        success: false,
        message: "session must be 'morning' or 'night'",
      });
    }

    // Normalise date separator to "/"
    const normalisedDate = date.replace(/-/g, "/");


// /dsfnsdlfkjdskfjkdsjkfjkdkjsf

    // Find active month
    const activeMonth = await Month.findOne({ status: true });
    if (!activeMonth) {
      return res.status(400).json({
        success: false,
        message: "No active month found. Please create an active month first.",
      });
    }

    // Fetch users – only active ones belonging to this admin
    const users = await User.find({
      _id: { $in: userIds },
      status: true,
      adminId: req.user.userId,
    }).select("_id name both role");

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid active users found for the given IDs",
      });
    }

    const created = [];
    const skipped = [];

    for (const user of users) {
      // Night session validation: user must have both == true
      if (session === "night" && !user.both) {
        skipped.push({
          userId: user._id,
          name: user.name,
          reason: "Not enrolled for night collection",
        });
        continue;
      }

      // Check if record already exists to avoid duplicates
      const existing = await Milk.findOne({
        userid: user._id.toString(),
        date: normalisedDate,
        session,
      });

      if (existing) {
        skipped.push({
          userId: user._id,
          name: user.name,
          reason: "Record already exists",
        });
        continue;
      }

      const newRecord = new Milk({
        userid: user._id.toString(),
        name: user.name,
        todaymilk: 0,
        todayfit: 0,
        todaymoney: 0,
        monthid: activeMonth._id.toString(),
        session,
        date: normalisedDate,
      });

      await newRecord.save();
      created.push(newRecord);
    }

    return res.status(201).json({
      success: true,
      message: `${created.length} record(s) created, ${skipped.length} skipped`,
      created,
      skipped,
    });
  } catch (error) {
    console.error("Error creating milk records:", error);
    next(error);
  }
};
