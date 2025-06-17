import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
    {

        title: {
            type: String,
            required: [true, "Title is required"],
        },
        description: {
            type: String,
            default: "",
        },
        data: {
            type: String,
            default: "",
        },

    } , 
    {timestamps: true}
);

export const Folder = mongoose.model("Folder", folderSchema);