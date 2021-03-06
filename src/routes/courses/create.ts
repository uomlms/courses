import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@uomlms/common';
import { Course } from '../../models/courses';
import { createAssignmentRouter } from '../assignments/create';

const router = express.Router();

router.post(
  '/api/courses',
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
    const { name, description, semester, professor } = req.body;
    const course = Course.build({
      name, description, semester, professor
    });

    await course.save();

    res
      .status(201)
      .send(course);
  });

router.use('/api/courses/:courseId/assignments', createAssignmentRouter);


export { router as createCourseRouter }