import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError } from '@uomlms/common';
import { Assignment } from '../../models/assignments';
import { courseExists } from '../../middlewares/course-exists';
import { validateAssignment } from '../../middlewares/validate-assignment';

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  requireAuth(),
  courseExists,
  async (req: Request, res: Response) => {
    const assignments = await Assignment.find({
      course: req.params.id
    });

    res.send(assignments);
  });

router.get(
  "/:id",
  requireAuth(),
  courseExists,
  validateAssignment,
  (req: Request, res: Response) => {
    res.send(req.assignment);
  });


export { router as getAssignmentsRouter }