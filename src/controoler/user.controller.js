import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
 import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken =async (userId)=>{
 try {
    const user=await User.findById(userId);
    const accessToken =user.generateAccessToken()
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken};

 } catch (error) {
    throw new ApiError(500,"Something went wrong while generating access and refresh token")
   
 }
}


const registerUser =asyncHandler(async (req,res)=>{
   //get user from frontend
   //validation 
   //check if usr exist
   //check for image ,check for avtar
   //upload them to cloudinary,avatar
   //create user object-create entry in db
   //remove password and refresh token field from response

   const {fullName,email,username,password} = req.body;
   if(
    [fullName,email,username,password].some((field)=>
        field?.trim()===""
    )
   ){
    throw new ApiError(400,"All fields are required")
   }
   
const existedUser=await User.findOne({
    $or:[{username},{email}]
})

if(existedUser){
    throw new ApiError(409,"User already exists");
}

const avatarLocalPath = req.files?.avatar[0]?.path;
// const coverImageLocalPath = req.files?.coverImage[0]?.path;
let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
}

console.log(avatarLocalPath);

if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
}

 
const avatar=await uploadOnCloudinary(avatarLocalPath);
const coverImage=await uploadOnCloudinary(coverImageLocalPath);

if(!avatar) {
    throw new ApiError(400, "Avatar file is required")
}

const user=await User.create({
    fullName,
    email,
    username:username.toLowerCase(),
    password,
    avatar :avatar.url,
    coverImage:coverImage?.url || ""
})

const createdUser=await User.findById(user._id).select(
    "-password -refreshToken" // - isliye lagaya hai ye hame nahi chahiye
)

if(!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
}
 return res.status(201).json(
    new ApiResponse(200,createdUser,"User created successfully")
 )
})


const loginUser= asyncHandler(async (req, res)=>{
     //req body->data
     //username or email
     //find the user
     //password check
     //access and refresh token
     //send cookie

     const {username,email,password}=req.body;
     if(!(username || email)) {
       throw new ApiError(400, "username or email required")
     }

     const user= await User.findOne({
        $or:[{username},{email}]
     })
     if(!user){
        throw new ApiError(500, "user does not exist")
     }

     const isPasswordValid=await user.isPasswordCorrect(password)

     if(!isPasswordValid){
        throw new ApiError(401, "Invalid user Credentials")
     }
   
     const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id);
    

     const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

     //cookies ko koi bhi modify kar sakta hai frontend se jab httponly and secure ko true karte hai to ye sirf server se modify ho sakti hai
   const option={
    httpOnly:true,
    secure:true,
   }
  
   return res
   .status(200)
   .cookie("accessToken",accessToken,option)
   .cookie("refreshToken",refreshToken,option)
   .json(
    new ApiResponse(
        200,
        {
         user: loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
    )
   )
})


const logoutUser=asyncHandler (async(req,res)=>{
await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined,
        }
    },
    {
        new:true,
    }
)
const option={
    httpOnly:true,
    secure:true,
   }
   return res
   .status(200)
   .clearCookie("accessToken",option)
   .clearCookie("refreshToken",option)
   .json(new ApiResponse(200,{},"User logged out successfully"))
})
 

const refreshAccessToken=asyncHandler (async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

   try {
    const decodedToken= jwt.verify(incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET)
  
       const user= await  User.findById(decodedToken?._id)
  
       if(!user){
         throw new ApiError(401,"invalid refresh  token")
       }
 
      if(incomingRefreshToken!==user?.refreshToken){
         throw new ApiError(401,"Refresh token is expired or used ")
      } 
 
      const option={
         httpOnly:true,
         secure:true
      }
 
     const{accessToken,refreshAccessToken}= await generateAccessAndRefreshToken(user._id)
  
     return res
     .status(200)
     .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
     new ApiResponse(
         200,
         {
         accessToken,refreshAccessToken
         },
         "Acress Token refreshed successfully"
     )
    )
   } catch (error) {
    throw new ApiError(401,error?.message||"Invalid refresh token")
   }

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
} 