// Importing mongoose library along with Document and Model types from it
import { UserTier } from "@/types/types";
import mongoose, { type Document, type Model } from "mongoose";

// Defining the structure of a todo item using TypeScript interfaces
export interface IUser {
  imageUrl: String;
  firstName: String;
  lastName: String;
  emailAddress: String;
  credits: Number;
  tier: UserTier;
}

// Merging IUser interface with mongoose's Document interface to create
// a new interface that represents a user document in MongoDB
export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Defining a mongoose schema for the todo document, specifying the types
// and constraints
const userSchema = new mongoose.Schema<IUserDocument>(
  {
    imageUrl: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    emailAddress: {
      type: String,
      unique: true,
      required: true,
    },
    credits: {
      type: Number,
      default: 150,
    },
    tier: {
      type: String,
      default: UserTier.basic,
    },
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' fields to the document
    timestamps: true,
  },
);

// Creating a mongoose model for the user document
const User: Model<IUserDocument> =
  mongoose.models?.User || mongoose.model("User", userSchema);

export default User;
