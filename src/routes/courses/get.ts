import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError } from '@uomlms/common';

import { Course } from '../../models/courses';

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

export { router as getCoursesRouter };