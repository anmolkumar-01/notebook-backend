import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Note } from "../models/notesSchema.js";
import { Folder } from "../models/folderSchema.js";


// 1. create a new note
const createNote = asyncHandler(async (req, res) =>{

    const {title,description , data , folderId} = req.body;
    console.log("Data coming in createNote controller from req.body:", req.body);

    if(!title || title.trim() === "" || !folderId){
        throw new ApiError(400, "Title and folderId is required");
    }


    const owner = req.user._id;

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
        users: [{user: owner , role: "admin"}], // by default the owner is the admin of the note    
        inFolder: folderId // assuming the folderId is passed in the request params
    })

    // adding the created note to the folder's notes array
    const folderInDb = await Folder.findById(folderId);
    folderInDb.notes.push(note._id);
    await folderInDb.save();

    res.status(201).json(new ApiResponse(201, note, "Note created successfully"));

})

// 2. delete a note by id
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

    // only admin can delete a note
    const currentUser = req.user._id

    const isAdmin = (current_note.users.some(users=> users.user.toString() === currentUser.toString() && users.role === "admin"));

    if(!isAdmin){
        throw new ApiError(403, "You are not authorized to delete this note , need admin role");
    }   

    // delete the note
    await current_note.deleteOne()
   

    res.status(200).json(new ApiResponse(200, null, "Note deleted successfully"));
} )

// 3. update a note by id - only admin or subadmin can update a note
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

    // only admin or subadmin can delete a note
    const currentUser = req.user._id

    const isAdminOrSubadminLogin = (current_note.users.some(users=> users.user.toString() === currentUser.toString() && (users.role === "admin" || users.role === "subadmin")));
    
    if(!isAdminOrSubadminLogin){
        throw new ApiError(403, "You are not authorized to update this note ( need subadmin or admin role )");
    }   

    // update the note with new data

    await current_note.updateOne({
        title: title? title.trim() : current_note.title,
        description: description? description.trim() : current_note.description,
        data: data? data :  current_note.data
    })

    res.status(200).json(new ApiResponse(200, null, "Note updated successfully"));
})

// 4. assign user to note - only admin can assign users
const assignUserToNote = asyncHandler(async (req, res) =>{

    // get note id from params
    const {noteId} = req.params;
    if(!noteId){
        throw new ApiError(400, "Note ID is required");
    }

    // get the user id and role
    const {userId, role} = req.body;
    if(!userId || !role){
        throw new ApiError(400, "User ID and role are required");
    }

    // find this note from the database
    const currentNote = await Note.findById(noteId);

    // only admin can assign users to a note
    const currentUser = req.user._id;

    const isAdmin = (currentNote.users.some(users => users.user.toString() === currentUser.toString() && users.role === "admin"));
    if(!isAdmin){
        throw new ApiError(403, "You are not authorized to assign users to this note ( need admin role )");
    }

    // if user is already assigned to the note , then change its role
    const existingUser = currentNote.users.find(users => users.user.toString() === userId.toString());
    if(existingUser){
        throw new ApiError(400, "This User is already assigned to this note");
    }
    
    // add this user to the users of the note
    await currentNote.updateOne({
        $push:{
            users: {
                user:userId,
                role: role.trim()
            }
        }
    })

    res.status(200).json(new ApiResponse(200, currentNote, "User assigned to note successfully"));
    
} )

// 5. update assigned user role in note - only admin can update user role
const updateAssignedUserRole = asyncHandler(async (req, res) =>{

    // get note id from params
    const {noteId} = req.params;
    if(!noteId){
        throw new ApiError(400, "Note ID is required");
    }

    // get the user id and role
    const {userId, role} = req.body;
    console.log("Data received in updateAssignedUserRole controller:", req.body);

    if(!userId || !role){
        throw new ApiError(400, "User ID and role are required");
    }

    // find this note from the database
    const currentNote = await Note.findById(noteId);
    
    if(!currentNote){
        throw new ApiError(404, "Note does not exist");
    }

    // only admin can update user role
    const currentUser = req.user._id;
    const isAdmin = (currentNote.users.some(users => users.user.toString() === currentUser.toString() && users.role === "admin"));
    if(!isAdmin){
        throw new ApiError(403, "You are not authorized to update user role in this note ( need admin role )");
    }

    // find this user in the note's users
    const existingUser = currentNote.users.find(users => users.user.toString() === userId.toString());
    if(!existingUser){
        throw new ApiError(404, "This user is not assigned to this note");
    }

    // update the role of the user
    await Note.updateOne(
    // find the user in current note whose role is to be updated
        { _id: currentNote._id, "users.user": userId },
        {
            $set: {
                "users.$.role": role.trim()
            }
        }
    )

    return res.status(200).json(new ApiResponse(200, "User role updated successfully"));
})

// 6. remove the user from the note - only admin can do this
const removeUserFromNote = asyncHandler(async (req, res) =>{
    // get note id from params
    const {noteId} = req.params;
    if(!noteId){
        throw new ApiError(400, "Note ID is required");
    }

    // get the user id and role
    const {userId} = req.body;
    console.log("Data received in updateAssignedUserRole controller:", req.body);

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }

    // find this note from the database
    const currentNote = await Note.findById(noteId);
    if(!currentNote){
        throw new ApiError(404, "Note does not exist");
    }

    // only admin can update user role
    const currentUser = req.user._id;
    const isAdmin = (currentNote.users.some(users => users.user.toString() === currentUser.toString() && users.role === "admin"));
    if(!isAdmin){
        throw new ApiError(403, "You are not authorized to update user role in this note ( need admin role )");
    }

    // find this user in the note's users
    const existingUser = currentNote.users.find(users => users.user.toString() === userId.toString());
    if(!existingUser){
        throw new ApiError(404, "This user is not assigned to this note");
    }

    // remove the user from the note's users
    await Note.updateOne(
        { _id: noteId },
        {
            $pull: {
                users: { user: userId }
            }
        }
    )

    res.status(200).json(new ApiResponse(200, null, "User removed from note successfully"));

})

export{
    createNote,
    deleteNote,
    updateNote,
    assignUserToNote,
    updateAssignedUserRole,
    removeUserFromNote
}