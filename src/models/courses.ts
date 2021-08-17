import mongoose from 'mongoose';
import { Assignment } from './assignments';

interface CourseAttrs {
  name: string;
  description: string;
  professor: string;
  semester: number;
  status?: string;
}

interface CourseDoc extends mongoose.Document {
  name: string;
  description: string;
  professor: string;
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
  professor: {
    type: String,
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

/**
 * Prehook for deleteOne middleware.
 * It deletes all the assignments of the deleted course.
 * @todo 
 *  deleteOne is called at document object. 
 *  Find a way to get Course in this keyword.
 *  if document is true, the hook will not trigger.
 */
CourseSchema.pre<any>("deleteOne", { document: false, query: true }, async function (next) {
  const courseId = this.getQuery()['_id'];
  const response = await Assignment.deleteMany({
    course: courseId
  });
  console.log(response);
  next();
})

CourseSchema.statics.build = (attrs: CourseAttrs) => {
  return new Course(attrs);
}

const Course = mongoose.model<CourseDoc, CourseModel>('Course', CourseSchema);

export { Course, CourseDoc }