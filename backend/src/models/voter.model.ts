import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

// 1. Interface for Instance Methods
export interface IVoterMethods {
  comparePassword(password: string): Promise<boolean>;
}

// 2. Interface for the Voter Document
export interface IVoter extends Document, IVoterMethods {
  studentId: string;
  firstname: string;
  lastname: string;
  password: string;
  district: number;
  hasVoted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 3. Schema Definition
const voterSchema = new Schema<IVoter, Model<IVoter>, IVoterMethods>(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    district: {
      type: Number,
      required: true,
      min: 1
    },
    hasVoted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Before saving any password, hash it
voterSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  // Note: Cost factor of 10-12 is strongly recommended for secure production hashing
  this.password = await bcrypt.hash(this.password, 10);
});

// Instance method to compare password
voterSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  console.log("Input Password:", password, typeof password);
  console.log("Hashed Password in DB:", this.password);

  if (!this.password) {
    console.error("ERROR: this.password is undefined! Check schema select option.");
    return false;
  }

  const isMatch = await bcrypt.compare(String(password), this.password);
  console.log("Is Password Match?:", isMatch);

  return isMatch;
};

// 4. Export the Model
export const Voter = mongoose.model<IVoter>("Voter", voterSchema);