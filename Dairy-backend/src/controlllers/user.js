import User from "../models/user.js";
import { BadRequestError, NotFoundError } from "../middleware/errorHandler.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import transporter from "../config/nodemiller.js";
import Milk from "../models/milk.js";

export const saveUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, tagnumber, status, both, maxUsers } = req.body;

    const emailexist = await User.find({ email });
    if (emailexist.length === 1) {
      throw new BadRequestError("Email already exists");
    }
    const phonexist = await User.find({ phone })
    if (phonexist.length === 1) {
      throw new BadRequestError("Phone number already exists");
    }
    const superadmin = await User.findOne({ role: 'superadmin' });
    if (role === 'superadmin' && superadmin) {
      throw new BadRequestError("A superadmin already exists you can not create more ok");
    }

    if (req.user.role === 'admin') {
      const admin = await User.findById(req.user.userId);
      const userCount = await User.countDocuments({ adminId: req.user.userId });
      if (admin.maxUsers <= userCount) {
        throw new BadRequestError("User limit reached for this admin");
      }
    }

    const createdBy = req.user.userId;
    let userAdminId = null;
    if (req.user.role === 'superadmin' && role === 'admin') {
      // When SuperAdmin creates an Admin, they are their own admin identifier? 
      // Or we leave it null for admins.
      userAdminId = null;
    } else if (req.user.role === 'admin' && role === 'user') {
      userAdminId = req.user.userId;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      tagnumber,
      maxUsers: maxUsers || 10,
      status: status !== undefined ? status : true,
      both: both !== undefined ? both : true,
      createdBy,
      adminId: userAdminId
    });
    // sent email also 

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Welcome to our platform",
      text: `Welcome to our platform, ${user.name}! You can now login to your account with email ${user.email} and password ${password}.`,
      html: `
      <h1>Welcome to our platform</h1>
      <p>Dear ${user.name},</p>
      <p>Welcome to our platform! You can now login to your account with email ${user.email} and password ${password}.</p>
      <p>Best regards,</p>
      <p>Our Team</p>
    `,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        user,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
      throw new BadRequestError("Please provide email or phone and password");
    }

    const user = await User.findOne(email ? { email } : { phone });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,        // REQUIRED for SameSite=None
      sameSite: true,    // REQUIRED for cross-domain
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "login successfully",
      auth_token: token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      data: user
    });

  } catch (err) {
    next(err);
  }
};


export const logoutUser = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    // Clear cookies exactly as they were set
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/", // always include path
    });

    res.clearCookie("auth_status", {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};


export const getUser = async (req, res, next) => {
  try {
    let filter = {};

    // If the requester is an admin, they can only see users they created/manage
    if (req.user.role === 'admin') {
      filter.adminId = req.user.userId;
      filter.role = 'user'; // Admins should typically only see 'user' role
    }
    // If superadmin, they can see everything unless they provide a specific filter

    const user = await User.find(filter).select('-password').select('-__v');
    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user,
        total: user.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getme = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      throw new NotFoundError("User not found");
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: user,

    });
  } catch (error) {
    next(error);
  }
};


export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("User ID is required");
    }
    // dont delete if milk is alred added
    const milk = await Milk.findOne({ userid: id });
    if (milk) {
      throw new BadRequestError("Milk is already added");
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    let { role, adminId } = req.query;
    let filter = {};

    // If an admin is requesting, force the filter to their own ID and role=user
    if (req.user.role === 'admin') {
      filter.adminId = req.user.userId;
      filter.role = 'user';
    } else {
      // Otherwise use query params (SuperAdmin can see anything)
      if (role) filter.role = role;
      if (adminId) filter.adminId = adminId;
    }

    const users = await User.find(filter).select("-password");
    res.status(StatusCodes.OK).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    next(error);
  }
};


export const islogin = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json({
      success: true,
      message: "User is logged in"
    });
  } catch (error) {
    next(error);
  }
};


export const editUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { name, email, phone, password, role, tagnumber, status, both } = req.body;


    const userExist = await User.find({ email });

    const emailChanged = userExist.length === 1 && userExist[0]._id.toString() !== id;
    if (emailChanged) {
      throw new BadRequestError("Email already exists");
    }

    const phonexist = await User.find({ phone });
    if (phonexist.length === 1 && phonexist[0]._id.toString() !== id) {
      throw new BadRequestError("Phone number already exists");
    }

    const user = await User.findByIdAndUpdate(id, { name, email, phone, password, role, tagnumber, status, both }, { new: true });
    if (!user) {
      throw new NotFoundError("User not found");
    }


    res.status(StatusCodes.OK).json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};


export const getbyid = async (req, resp, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      throw new NotFoundError("User not found");
    }

    resp.status(StatusCodes.OK).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updatestatus = async (req, resp, next) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.status = !user.status;
    await user.save();

    resp.status(StatusCodes.OK).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export const updateBothStatus = async (req, resp, next) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.both = !user.both;
    await user.save();

    resp.status(StatusCodes.OK).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError("Please provide an email address");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("No user found with this email address");
    }

    // Generate token valid for 15 minutes
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Password Reset Request - DairyConnect",
      text: `Hello ${user.name},\n\nYou requested a password reset. Click the following link to reset your password:\n${resetLink}\n\nThis link will expire in 15 minutes.\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1d4ed8; margin-bottom: 16px;">DairyConnect Password Reset</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>You requested a password reset for your DairyConnect account. Click the button below to reset your password:</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${resetLink}" target="_blank" style="background-color: #1d4ed8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; font-size: 13px; color: #2563eb;"><a href="${resetLink}">${resetLink}</a></p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">This link will expire in 15 minutes. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new BadRequestError("Token and new password are required");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters long");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new BadRequestError("Invalid or expired password reset link");
    }

    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError("Invalid or expired password reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    next(error);
  }
};