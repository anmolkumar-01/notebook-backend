import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Folder } from "../models/folderSchema.js";


// 1. create a new folder
const createFolder = asyncHandler(async (req, res) => {
    const { title } = req.body;
    if(!title) {
        throw new ApiError(400, "Title is required to create a folder");
    }

    const folder = await Folder.create({
        title: title.trim(),
        createdBy: req.user._id, // Assuming req.user is populated with the authenticated user's info
    })

    res.status(201).json(new ApiResponse(201, folder, "Folder created successfully"));
})

// 2. updata a folder
const updateFolder = asyncHandler(async (req, res) => {

    const { folderId } = req.params;
    const { title } = req.body;
    console.log("folderId", folderId);

    if (!folderId) {
        throw new ApiError(400, "Folder ID is required to update a folder");
    }

    if (!title) {
        throw new ApiError(400, "Title is required to update a folder");
    }

    const folderInDb = await Folder.findById(folderId); 

    if (!folderInDb) {
        throw new ApiError(404, "Folder not found");
    }

    if(folderInDb.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this folder");
    }

    const data = await folderInDb.updateOne(
        {title: title.trim()}, 
        {
        new: true, // Return the updated document
        }
    )

    res.status(200).json(new ApiResponse(200, data, "Folder updated successfully"));
})

// 3. delete a folder
const deleteFolder = asyncHandler(async (req, res) => {
    const { folderId } = req.params;

    if (!folderId) {
        throw new ApiError(400, "Folder ID is required to update a folder");
    }

    const folderInDb = await Folder.findById(folderId); 

    if (!folderInDb) {
        throw new ApiError(404, "Folder not found");
    }

    if(folderInDb.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this folder");
    }

    await folderInDb.deleteOne();

    res.status(200).json(new ApiResponse(200, null, "Folder deleted successfully"));
})

// 4. show all folders of currently logged in user
const allFolders = asyncHandler(async (req, res) => {

    const user = req.user._id;

    const folders = await Folder.find({ createdBy: user });
    if (!folders || folders.length === 0) {
        throw new ApiError(404, "No folders found for the user");
    }

    res.status(200).json(new ApiResponse(200, folders, "Folders retrieved successfully"));
})

// 5. get a folder by ID 
const getFolderById = asyncHandler(async (req, res) => {
    const { folderId } = req.params;

    if (!folderId) {
        throw new ApiError(400, "Folder ID is required to retrieve a folder");
    }

    const folder = await Folder.findById(folderId);

    if (!folder) {
        throw new ApiError(404, "Folder not found");
    }

    // Check if the folder is created by the logged-in user
    if (folder.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to view this folder");
    }

    res.status(200).json(new ApiResponse(200, folder, "Folder retrieved successfully"));
})

export {
    createFolder,
    updateFolder,
    deleteFolder,
    allFolders,
    getFolderById
}