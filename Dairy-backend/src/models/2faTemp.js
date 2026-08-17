import mongoose from "mongoose";
const twoFactorAuthSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    expDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TwoFactorAuth = mongoose.model(
  "TwoFactorAuth",
  twoFactorAuthSchema
);