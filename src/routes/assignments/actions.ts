import express, { Request, Response } from 'express';
import { requireAuth, kafka, NotFoundError, BadRequestError, getObject } from '@uomlms/common';
import { Submission } from '../../models/submission';
import { courseExists } from '../../middlewares/course-exists';
import { validateAssignment } from '../../middlewares/validate-assignment';
import { AssignmentSubmitProducer } from '../../kafka/producers/assignment-submit-producer';
import { uploadS3 } from '@uomlms/common';
import path from 'path';

const basePath = '/api/courses/:courseId/assignments/:id';
const router = express.Router();

router.post(`${basePath}/test-submit`, (req: Request, res: Response) => {
  new AssignmentSubmitProducer(kafka.producer).produce({
    assignmentId: "assignment.id",
    submissionId: "submission.id",
    configFile: "",
    sourceFile: "",
    user: {
      token: "currentUser.token"
    }
  });

  res.send({});
});


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
    destination: 'submissions'
  }).single('source'),
  async (req: Request, res: Response) => {
    const sourceFile = req.file as Express.MulterS3.File;
    if (!sourceFile) {
      throw new BadRequestError("Source file is mandatory");
    }

    const assignment = req.assignment!;
    const currentUser = req.currentUser!;
    const submission = Submission.build({
      uid: currentUser.id,
      assignmentId: assignment.id,
      status: 'pending',
      files: [sourceFile.key]
    });

    await submission.save();

    new AssignmentSubmitProducer(kafka.producer).produce({
      assignmentId: assignment.id,
      submissionId: submission._id,
      configFile: assignment?.configFile,
      sourceFile: sourceFile.key,
      user: {
        token: currentUser.token
      }
    });

    res.send(submission);
  });

router.get(
  `${basePath}/config`,
  requireAuth("staff"),
  courseExists,
  validateAssignment,
  async (req: Request, res: Response) => {
    const assignment = req.assignment!;
    if (!assignment.configFile) {
      throw new NotFoundError();
    }

    const configObj = await getObject(assignment.configFile);
    const filename = path.basename(assignment.configFile);
    res.attachment(filename);
    res.send(configObj.Body);
  }
);

router.post(
  `${basePath}/config`,
  requireAuth("staff"),
  courseExists,
  validateAssignment,
  uploadS3({
    destination: 'configs'
  }).single('config'),
  async (req: Request, res: Response) => {
    const file = req.file as Express.MulterS3.File;
    const assignment = req.assignment!;

    assignment.set({
      configFile: file.key
    });

    await assignment.save();

    res.send(assignment);
  });

export { router as assignmentActionsRouter };