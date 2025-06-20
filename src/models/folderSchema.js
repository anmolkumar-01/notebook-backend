import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
        },
        notes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Note",
        }],
        createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner is required"],  
        }
    } , 
    {timestamps: true}

);
export const Folder = mongoose.model("Folder", folderSchema);