import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@uomlms/common';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
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
      // .isISO8601({
      //   strict: true,
      //   strictSeparator: true
      // })
      .isDate({
        format: 'yyyy-mm-ddThh:mm:ss',
        strictMode: true,
        delimiters: ['-']
      })
      .withMessage('Deadline should be a date.'),
    body('type')
      .not()
      .isEmpty()
      .withMessage("Type is required.")
  ],
  validateRequest,
  (req: Request, res: Response) => {
    res.send({});
  });

export { router as createAssignmentRouter }