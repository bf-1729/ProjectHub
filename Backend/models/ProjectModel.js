import mongoose from "mongoose";

// Milestone Schema
const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

// Task Schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  milestones: [MilestoneSchema],
});

// Project Schema
const ProjectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true, trim: true },
    projectDescription: { type: String, trim: true },
    supervisors: [{ type: String, trim: true }], // can later convert to ObjectId ref
    projectbudget: { type: Number, default: 0 },
    projectStatus: {
      type: String,
      enum: ["active", "completed", "hold"],
      default: "active",
    },
    assignedWorkers: [
      {
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
        name: { type: String, trim: true },
      },
    ],
    tasks: [TaskSchema],
    progress: { type: Number, default: 0 },
    images: [String],
    pdfs: [String], // ✅ renamed for consistency with backend controller
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
