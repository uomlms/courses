import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@uomlms/common';
import { Course } from '../../models/courses';

export const courseExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError()
  }
  next();
}