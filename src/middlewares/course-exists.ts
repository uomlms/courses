import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@uomlms/common';
import { Course, CourseDoc } from '../models/courses';


// declares an extra attribute to Request Object
declare global {
  namespace Express {
    interface Request {
      course?: CourseDoc
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