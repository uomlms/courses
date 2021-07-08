import mongoose from 'mongoose';


interface AssignmentAttrs {
  name: string;
  description: string;
  files?: string[];
  deadline: Date;
  type: string
  status?: string;
}

interface AssignmentDoc extends mongoose.Document {
  name: string;
  description: string;
  files?: string[];
  deadline: Date;
  type: string
  status?: string;
}

interface AssignmentModel extends mongoose.Model<AssignmentDoc> {
  build(attrs: AssignmentAttrs): AssignmentDoc;
}

const AssignmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  files: {
    type: [String],
  },
  deadline: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ["obligatory", "optional"],
    default: "optional",
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive", "expired"],
    default: "active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

AssignmentSchema.statics.build = (attrs: AssignmentAttrs) => {
  return new Assignment(attrs);
}

const Assignment = mongoose.model<AssignmentDoc, AssignmentModel>('Assignment', AssignmentSchema);

export { Assignment }