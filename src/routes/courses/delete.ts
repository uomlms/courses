import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError } from '@uomlms/common';
import { Course } from '../../models/courses';
import { deleteAssignmentRouter } from '../assignments/delete';

const router = express.Router();

router.delete(
  '/api/courses/:id',
  requireAuth('staff'),
  async (req: Request, res: Response) => {
    const course = Course.findById(req.params.id);
    if (!course) {
      throw new NotFoundError();
    }

    await course.deleteOne();
    res.send({});
  });

router.use("/api/courses/:courseId/assignments", deleteAssignmentRouter);

export { router as deleteCourseRouter };