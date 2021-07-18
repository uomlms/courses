import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, requireAuth, NotFoundError } from '@uomlms/common';
import { courseExists } from '../../middlewares/course-exists';
import { Assignment } from '../../models/assignments';

const router = express.Router({ mergeParams: true });

router.patch(
  "/:id",
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
    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError();
    }

    const {
      name,
      description,
      deadline,
      type,
      status
    } = req.body;

    assignment.set({
      name,
      description,
      deadline,
      type,
      status,
      course: req.params.courseId
    });

    await assignment.save();
    res.send(assignment);
  });

export { router as updateAssignmentRouter }