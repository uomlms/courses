import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@uomlms/common';
import { Assignment, AssignmentDoc } from '../models/assignments';

// declares an extra attribute to Request Object
declare global {
  namespace Express {
    interface Request {
      assignment?: AssignmentDoc
    }
  }
}

export const validateAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const assignmentId = req.params.id;
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    course: req.params.courseId
  });

  if (!assignment) {
    throw new NotFoundError();
  }

  req.assignment = assignment;
  next();
}