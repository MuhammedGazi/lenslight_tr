import mongoose from "mongoose";

const { Schema } = mongoose;

const photoSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true, 
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: Schema.Types.ObjectId, //User modelindeki _id değeri ile ilişkilendirildi.
    ref: "User", //User modeli ile ilişkilendirildi.
  },
  url: {
    type: String, //cloudinary url
    required: true,
  },
  image_id: { //cloudinary image id
    type: String,
  },
});

const Photo = mongoose.model("Photo", photoSchema);

export default Photo;
