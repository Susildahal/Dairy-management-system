import mongoose from "mongoose";

const monthSchema = new mongoose.Schema({
    year: {
        type: String,
        required: [true, 'Year is required'],
    },
    month: {
        type: String,
        required: [true, 'Month name is required'],

    },
    status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
monthSchema.index({ year: 1, month: 1 }, { unique: true });


const Month = mongoose.model("Month", monthSchema);

export default Month;
