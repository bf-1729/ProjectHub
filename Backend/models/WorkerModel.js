import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true },
    Role: { type: String, required: true },
    workerType : {type : String, required: true},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Worker", workerSchema); // ✅ capitalized model name
