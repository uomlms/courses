import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@uomlms/common';
import { courseExists } from './course-exists';
import { Assignment } from '../../models/assignments';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  requireAuth("staff"),
  [
    body('name')
      .not()
      .isEmpty()
      .withMessage('Name is required.'),
    body('description')
      .not()
      .isEmpty()
      .withMessage('Description is required.'),
    body('deadline')
      .isISO8601({
        strict: true,
        strictSeparator: true
      })
      .withMessage('Deadline should be a date.'),
    body('type')
      .not()
      .isEmpty()
      .withMessage("Type is required.")
  ],
  validateRequest,
  courseExists,
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      deadline,
      type,
      status
    } = req.body;

    const assignment = Assignment.build({
      name,
      description,
      deadline,
      type,
      status,
      course: req.params.courseId
    });

    await assignment.save();

    res.status(201).send(assignment);
  });

export { router as createAssignmentRouter }