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

    // if current title already exists in collection, throw error
    const existingNote = await Note.findOne({ title: title.trim(), owner: owner});

    if(existingNote){
        throw new ApiError(400, "A note with the same title already exists");
    }

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

// delete a note
const deleteNote = asyncHandler(async (req, res) =>{

    // take the note id
    const {noteId} = req.params;
    console.log("Note ID received in deleteNote notes controller:", req.params);

    if(!noteId){
        throw new ApiError(400, "Note ID is required");
    }

    // find note with given id
    const current_note = await Note.findById(noteId);
    if(!current_note){
        throw new ApiError(404, "Note does not exist");
    }

    // delete the note
    await current_note.deleteOne()
   

    res.status(200).json(new ApiResponse(200, null, "Note deleted successfully"));
} )

// update a note
const updateNote = asyncHandler(async (req, res) =>{

    // take the note id from params
    const {noteId} = req.params;
    console.log("Note ID received in updateNote controller:", noteId);

    // take the new data from body
    const {title, description,data} = req.body;
    console.log("Data received in updateNote controller:", req.body);

    if(!title || !title.trim()){
        throw new ApiError(400, "Title is required");
    }

    if(!noteId){
        throw new ApiError(400, "Note ID is required");
    }

    // find the note with given id
    const current_note = await Note.findById(noteId);
    if(!current_note){
        throw new ApiError(404, "Note does not exist");
    }

    // if same title already exists in collection , throw error ( case sensitive)
    const existingNote = await Note.findOne({ title: title.trim(), owner: current_note.owner});

    if(existingNote){
        throw new ApiError(400, "A note with the same title already exists");
    }

    // update the note with new data

    await current_note.updateOne({
        title: title? title.trim() : current_note.title,
        description: description? description.trim() : current_note.description,
        data: data? data :  current_note.data
    })

    res.status(200).json(new ApiResponse(200, null, "Note updated successfully"));
})

//

export{
    createNote,
    deleteNote,
    updateNote
}