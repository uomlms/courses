import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError } from '@uomlms/common';
import { Course } from '../../models/courses';
import { getAssignmentsRouter } from '../assignments/get';

const router = express.Router();

router.get(
  '/api/courses/:id',
  requireAuth(),
  async (req: Request, res: Response) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
      throw new NotFoundError();
    }
    res.send(course);
  });

router.get(
  '/api/courses',
  requireAuth(),
  async (req: Request, res: Response) => {
    const courses = await Course.find({});
    res.send(courses);
  }
)

router.use("/api/courses/:courseId/assignments", getAssignmentsRouter);

export { router as getCoursesRouter };