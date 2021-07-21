import mongoose from 'mongoose';

interface SubmissionAttrs {
  uid: string;
  assignmentId: string;
  status: string;
  result?: string;
  files?: string[];
}

interface SubmissionDoc extends mongoose.Document {
  uid: string;
  assignmentId: string;
  status: string;
  result?: string;
  files?: string[];
}

interface SubmissionModel extends mongoose.Model<SubmissionDoc> {
  build(attrs: SubmissionAttrs): SubmissionDoc;
}

const SubmissionSchema = new mongoose.Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User is required"]
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: [true, "Assignment is required"]
  },
  status: {
    type: String,
    enum: {
      values: ["pending", "completed"],
      message: "Type {VALUE} is not supported. Type is either pending or completed.",
    },
    default: "pending",
    required: true
  },
  result: {
    type: String
  },
  files: {
    type: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

SubmissionSchema.statics.build = (attrs: SubmissionAttrs) => {
  return new Submission(attrs);
}

const Submission = mongoose.model<SubmissionDoc, SubmissionModel>('Submission', SubmissionSchema);

export { Submission }