import mongoose from 'mongoose';

const notesSchema = new mongoose.Schema(
    {

        title: {
            type: String,
            required: [true, "Title is required"],
            unique: true,
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
            user: {
                type:mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            role:{
                type: String,
                enum: ["admin", "subadmin", "user"],
                default: "user",
            }
        }]

    } , 
    {timestamps: true}
);

export const Note = mongoose.model("Note", notesSchema);