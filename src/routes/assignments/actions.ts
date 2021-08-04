import express, { Request, Response } from 'express';
import { requireAuth, kafka, NotFoundError } from '@uomlms/common';
import { Submission } from '../../models/submission';
import { courseExists } from '../../middlewares/course-exists';
import { validateAssignment } from '../../middlewares/validate-assignment';
import { AssignmentSubmitProducer } from '../../kafka/producers/assignment-submit-producer';
import { uploadS3 } from '@uomlms/common';

const basePath = '/api/courses/:courseId/assignments/:id';
const router = express.Router();

router.get(
  `${basePath}/submit`,
  requireAuth("student"),
  courseExists,
  validateAssignment,
  async (req: Request, res: Response) => {
    const assignment = req.assignment!;
    const currentUser = req.currentUser!;
    const assignments = await Submission.find({
      uid: currentUser.id,
      assignmentId: assignment.id
    });

    if (!assignments.length) {
      throw new NotFoundError();
    }

    res.send(assignments);
  });

router.post(
  `${basePath}/submit`,
  requireAuth("student"),
  courseExists,
  validateAssignment,
  uploadS3({
    destination: 'tmp'
  }).single('source'),
  async (req: Request, res: Response) => {
    const sourceFile = req.file as Express.MulterS3.File;
    const assignment = req.assignment!;
    const currentUser = req.currentUser!;
    const submission = Submission.build({
      uid: currentUser.id,
      assignmentId: assignment.id,
      status: 'pending',
      files: [sourceFile?.location]
    });

    await submission.save();

    new AssignmentSubmitProducer(kafka.producer).produce({
      assignmentId: assignment.id,
      configFile: assignment?.configFile,
      sourceFile: sourceFile?.location,
      userId: currentUser.id
    });

    res.send(submission);
  });

router.post(
  `${basePath}/upload/config`,
  requireAuth("staff"),
  courseExists,
  validateAssignment,
  uploadS3({
    destination: 'configs'
  }).single('config'),
  async (req: Request, res: Response) => {
    const file = req.file as Express.MulterS3.File;
    const assignment = req.assignment;

    assignment!.set({
      configFile: file.location
    });

    await assignment!.save();

    res.send(assignment);
  });

export { router as assignmentActionsRouter };