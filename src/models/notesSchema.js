import mongoose from 'mongoose';

const notesSchema = new mongoose.Schema(
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
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner is required"],
        },
        users:[{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User",
        }]

    } , 
    {timestamps: true}
);

export const Note = mongoose.model("Note", notesSchema);