import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
    {
        ttitle: {
            type: String,
            required: [true, "Title is required"],
        },
        data: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notes",
        },
        createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner is required"],  
        }
    } , 
    {timestamps: true}

);
export const Folder = mongoose.model("Folder", folderSchema);