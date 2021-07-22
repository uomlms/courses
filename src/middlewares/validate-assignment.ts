import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@uomlms/common';
import { Assignment } from '../models/assignments';
import mongoose from 'mongoose';

// defines the payload of the Assignment
interface AssignmentPayload extends mongoose.Document {
  name: string;
  description: string;
  files?: string[];
  deadline: Date;
  configFile?: string
  type: string
  status?: string;
  course: string;
}

// declares an extra attribute to Request Object
declare global {
  namespace Express {
    interface Request {
      assignment?: AssignmentPayload
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