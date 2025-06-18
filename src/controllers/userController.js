import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// access and refresh token generation

const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();  // short period
        const refreshToken = user.generateRefreshToken();  // long period

        // save refresh token in db
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false })

        return {accessToken , refreshToken}


    }catch(error){
        throw new ApiError(500 , "something went wrong while generating access and refresh token in user.controller.js")
    }
}

// register user
export const Register = asyncHandler(async (req, res) => {
    const { email, password, username, confirmPassword, role } = req.body;

    console.log(" data coming in user controller register from req.body:", req.body);
  
    // Check for required fields first
    if (!username || !email || !password || !confirmPassword ) {
      return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
    }
  
    if (
      [username, email, password, confirmPassword].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }
  
   
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });


    if (existedUser) {
      throw new ApiError(400, "User already exists");
    }
  
    let coverImageLocalPath;

    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }
  
    if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover Image file is required");
    }
  
    const coverImage = await uploadonCloudinary(coverImageLocalPath);
    if (!coverImage) {
      throw new ApiError(400, "Cover Image upload failed on Cloudinary");
    }
  
    const user = await User.create({
      confirmPassword: confirmPassword.trim(),
      role: role || "user",
      coverImage: coverImage?.url || "",
      email: email.trim(),
      password,
      username: username.toLowerCase().trim(),
    });
  
    const createdUser = await User.findOne({ _id: user._id }).select("-password -refreshToken -confirmPassword");
    if (!createdUser) {
      throw new ApiError(400, "User registration failed");
    }
  
    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});
  

 // login user
export const loginUser = asyncHandler( async(req , res) =>{ 

    // 1. req body -> data

    const {email , username , password} = req.body

    
    
    // 2. username or email
    if(!username && !email) {
        throw new ApiError(400 , "Username or email is required in user.controller.js loginuser")
    }
    
    // 3. find the user
    
    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404 , "User does not exists in user.controller.js loginuser")
    }
    // 4. password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials(incorrect password) in user.controller.js loginuser")
    }
    // 5. access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    // 6. send cookie
    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res.status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "User logged In Successfully"
        )
    )
    
})
  
// logout user
export const logoutUser = asyncHandler( async(req,res) =>{
    
    // clear cookies
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    // clear his access and refresh token
    const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200 , {}, `user logged out successfully`))
})
  
// refresh access token
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Request");
    }
  
    try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
      if(!decodedToken) { 
        throw new ApiError(401, "Invalid Refresh  Token hai " );
      }
      const user = await User.findById(decodedToken?._id);
      
      if (!user) {
        throw new ApiError(401, "Invalid Refresh Token");
      }
  
      
   
      

      const options = {
        httpOnly: true,
        secure: true, 
        sameSite: 'None', 
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
      
  
      const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
      user.refreshToken = newRefreshToken;
      await user.save();

      return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken: newRefreshToken },
            "Access Token Refreshed"
          )
        );
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});
  
  