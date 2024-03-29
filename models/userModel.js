import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Email area is required"],
      lowercase: true,
      validate: [validator.isAlphanumeric, "Only Alphanumeric characters"],
    },
    email: {
      type: String,
      required: [true, "Email area is required"],
      unique: true,
      validate: [validator.isEmail, "Valid email is required"],
    },
    password: {
      type: String,
      required: [true, "Email area is required"],
      minLength: [4, "At least 4 characters"],
    },
    followers: [
      {
        type: Schema.Types.ObjectId, //type olarak user id si gireceğiz çünkü user ı takip ediyoruz
        ref: "User", //ref olarak da user modelini belirtiyoruz
      },
    ],
    followings: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, //db de createdAt ve updatedAt otomatik olarak ekler
  }
);

userSchema.pre("save", function (next) {
  const user = this;
  bcrypt.hash(user.password, 10, (err, hash) => {
    user.password = hash;
    next();
  });
});

const User = mongoose.model("User", userSchema);

export default User;
