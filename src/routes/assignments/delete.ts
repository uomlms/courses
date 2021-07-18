import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError } from '@uomlms/common';
import { courseExists } from '../../middlewares/course-exists';
import { Assignment } from '../../models/assignments';

const router = express.Router({ mergeParams: true });

router.delete(
  "/:id",
  requireAuth("staff"),
  courseExists,
  async (req: Request, res: Response) => {
    const assignmentId = req.params.id;
    const assignment = Assignment.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError();
    }

    await Assignment.deleteOne(assignment);
    res.send({});
  });

export { router as deleteAssignmentRouter };