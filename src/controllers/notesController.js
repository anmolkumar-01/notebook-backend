import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Note } from "../models/notesSchema.js";


// create a new note
const createNote = asyncHandler(async (req, res) =>{

    const {title,description , data} = req.body;
    console.log("Data coming in createNote controller from req.body:", req.body);

    if(!title || title.trim() === ""){
        throw new ApiError(400, "Title is required");
    }

    const owner = req.user._id;
    if(!owner){
        throw new ApiError(400, "Owner is required");
    }
    const users = req.user?._id;

    // create a new note
    const note = await Note.create({
        title: title.trim(),
        description: description ? description.trim() : "",
        data: data ? data.trim() : "",
        owner,
        users: [owner]
    })

    res.status(201).json(new ApiResponse(201, note, "Note created successfully"));

})

export{
    createNote
}