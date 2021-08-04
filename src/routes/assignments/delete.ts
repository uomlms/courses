import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError } from '@uomlms/common';
import { courseExists } from '../../middlewares/course-exists';
import { validateAssignment } from '../../middlewares/validate-assignment';
import { Assignment } from '../../models/assignments';

const router = express.Router({ mergeParams: true });

router.delete(
  "/:id",
  requireAuth("staff"),
  courseExists,
  validateAssignment,
  async (req: Request, res: Response) => {
    const assignmentId = req.params.id;
    const assignment = Assignment.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError();
    }

    await Assignment.findByIdAndRemove(req.params.id);
    res.send({});
  });

export { router as deleteAssignmentRouter };