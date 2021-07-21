import express, { Request, Response } from 'express';
import { validateRequest, requireAuth, kafka } from '@uomlms/common';
import { courseExists } from '../../middlewares/course-exists';
import { validateAssignment } from '../../middlewares/validate-assignment';
import { AssignmentSubmitProducer } from '../../kafka/producers/assignment-submit-producer';

const router = express.Router();

router.post(
  '/api/courses/:courseId/assignments/:id/submit',
  requireAuth("student"),
  courseExists,
  validateAssignment,
  async (req: Request, res: Response) => {
    new AssignmentSubmitProducer(kafka.producer).produce({
      assignmentId: req.params.id,
      config: "Test Config",
      sourceCode: "Test Source Code",
      userId: req.currentUser?.id || ""
    });
  });

export { router as submitAssignmentRouter };