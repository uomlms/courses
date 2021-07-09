import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError } from '@uomlms/common';
import { Course } from '../../models/courses';
import { Assignment } from '../../models/assignments';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  // requireAuth("staff"),
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
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      files,
      deadline,
      type,
      status
    } = req.body;

    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError()
    }

    const assignment = Assignment.build({
      name,
      description,
      files,
      deadline,
      type,
      status,
      course: courseId
    });

    await assignment.save();

    res.status(201).send(assignment);
  });

export { router as createAssignmentRouter }