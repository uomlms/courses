import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@uomlms/common';
import { body } from 'express-validator';

import { Course } from '../../models/courses';


const router = express.Router();

router.patch(
  '/api/courses/:id',
  requireAuth,
  [
    body('name')
      .not()
      .isEmpty()
      .withMessage('Name is required'),
    body('description')
      .not()
      .isEmpty()
      .withMessage('Description is required'),
    body('semester')
      .isFloat({ min: 1, max: 12 })
      .withMessage('Semester is required'),
  ],
  validateRequest,
  (req: Request, res: Response) => {
    res.send({});
  });

export { router as updateCourseRouter };