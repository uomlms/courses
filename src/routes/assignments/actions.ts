import express, { Request, Response } from 'express';
import { requireAuth, kafka } from '@uomlms/common';
import { courseExists } from '../../middlewares/course-exists';
import { validateAssignment } from '../../middlewares/validate-assignment';
import { AssignmentSubmitProducer } from '../../kafka/producers/assignment-submit-producer';
import { uploadS3 } from '../../middlewares/upload-s3';

const basePath = '/api/courses/:courseId/assignments/:id';
const router = express.Router();

router.post(
  `${basePath}/submit`,
  // requireAuth("student"),
  courseExists,
  validateAssignment,
  uploadS3.single('source'),
  async (req: Request, res: Response) => {
    const sourceFile = req.file as Express.MulterS3.File;
    new AssignmentSubmitProducer(kafka.producer).produce({
      assignmentId: req.params.id,
      configFile: req.assignment?.configFile,
      sourceFile: sourceFile.location,
      userId: req.currentUser?.id || ""
    });
  });

router.post(
  `${basePath}/upload/config`,
  // requireAuth("staff"),
  courseExists,
  validateAssignment,
  uploadS3.single('config'),
  async (req: Request, res: Response) => {
    const file = req.file as Express.MulterS3.File;
    const assignment = req.assignment;

    assignment?.set({
      configFile: file.location
    });

    await assignment?.save();

    res.send(assignment);
  });

export { router as assignmentActionsRouter };