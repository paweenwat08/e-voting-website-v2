import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IdentityMethods {
  comparePassword(password: string): Promise<boolean>;
}

export interface IdentityDocument extends Document, IdentityMethods {
  identityId: string;
  userId: string;
  passwordHash: string;
  role: "voter" | "admin";
  status: "active" | "unactive";
  createdAt: Date;
  updatedAt: Date;
}

const identitySchema = new Schema<IdentityDocument>(
  {
    identityId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["voter", "admin"],
      required: true,
      default: "voter",
    },

    status: {
      type: String,
      enum: ["active", "unactive"],
      required: true,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

identitySchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) {
    return;
  }

  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

identitySchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const Identity = mongoose.model<IdentityDocument>(
  "Identity",
  identitySchema
);