import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@uomlms/common';
import { Course } from '../models/courses';


// defines the payload of the course
interface CoursePayload {
  name: string;
  description: string;
  semester: number;
  status?: string;
}

// declares an extra attribute to Request Object
declare global {
  namespace Express {
    interface Request {
      course?: CoursePayload
    }
  }
}

export const courseExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError();
  }

  req.course = course;
  next();
}