import mongoose from 'mongoose';


interface CourseAttrs {
  name: string;
  description: string;
  semester: number;
  status?: string;
}

interface CourseDoc extends mongoose.Document {
  name: string;
  description: string;
  semester: number;
  status?: string;
}

interface CourseModel extends mongoose.Model<CourseDoc> {
  build(attrs: CourseAttrs): CourseDoc;
}

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
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

CourseSchema.statics.build = (attrs: CourseAttrs) => {
  return new Course(attrs);
}

const Course = mongoose.model<CourseDoc, CourseModel>('Course', CourseSchema);

export { Course, CourseDoc }