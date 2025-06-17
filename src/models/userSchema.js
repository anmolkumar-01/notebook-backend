import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new Schema(
  { 
    name : {
        type: String,        
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    confirmPassword: {
      type: String,
    },
    coverImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      required: true,
      default: "user",
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10);
  }

  next();
});

UserSchema.methods.generateJwtToken = function () {
  return jwt.sign({ user: this._id }, process.env.SECRET_KEY);
};

UserSchema.methods.isPasswordCorrect = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const User = mongoose.model("User", UserSchema);
