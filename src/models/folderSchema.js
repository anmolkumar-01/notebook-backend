import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
    {




    } , 
    {timestamps: true}
);

export const Folder = mongoose.model("Folder", folderSchema);