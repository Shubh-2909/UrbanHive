import { User } from "../models/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const newUser = async (req, res, next) => {
  try {
    const { name, email, photo, gender, _id, dob } = req.body;

    let user = await User.findById(_id);
    if(user){
      return res.status(200).json({
        success:true,
        message:`Welcome , ${user.name}`
      })
    }

    if(!_id || !name || !email || !photo || !gender || !dob ){
      return next(new ErrorHandler("Please add all fields" , 400))
    }

    user = await User.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob),
    });
    console.log("Fine");
    return res.status(201).json({
      success: true,
      message: `Welcome ,   ${user.name}!`,
    });
  } 
  catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error",
      err: error,
    });
  }
};

export const getAllUsers = async (req,res,next) => {
  try {
    const users = await User.find({});
    return res.status(201).json({
      success: true,
      users,
    })
  } catch (error) {
    return next(new ErrorHandler("Error in fetching all users" , 500))
  }
}


export const getUser = async (req,res,next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if(!user){
      return next(new ErrorHandler("Invalid Id" , 400))
    }
    return res.status(201).json({
      success: true,
      user,
    })
  } catch (error) {
    return next(new ErrorHandler("Error in fetching the user's data" , 500))
  }
}

export const deleteUser = async (req,res,next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if(!user){
      return next(new ErrorHandler("Invalid Id" , 400))
    }
    await user.deleteOne();
    return res.status(201).json({
      success: true,
      message : "User Deleted Successfully"
    })
  } catch (error) {
    return next(new ErrorHandler("Error in deleting the user's data" , 500))
  }
}