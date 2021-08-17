import express, { Request, Response } from 'express';
import { NotFoundError, requireAuth, validateRequest } from '@uomlms/common';
import { body } from 'express-validator';
import { Course } from '../../models/courses';
import { updateAssignmentRouter } from '../assignments/update';

const router = express.Router();

router.patch(
  '/api/courses/:id',
  requireAuth("staff"),
  [
    body('name')
      .not()
      .isEmpty()
      .withMessage('Name is required'),
    body('description')
      .not()
      .isEmpty()
      .withMessage('Description is required'),
    body('professor')
      .not()
      .isEmpty()
      .withMessage('Professor is required'),
    body('semester')
      .isFloat({ min: 1, max: 12 })
      .withMessage('Semester is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
      throw new NotFoundError();
    }

    const { name, description, semester, professor } = req.body;
    course.set({ name, description, semester, professor });

    await course.save();

    res.send(course);
  });

router.use('/api/courses/:courseId/assignments', updateAssignmentRouter);

export { router as updateCourseRouter };