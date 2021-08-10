import { Consumer, Topics, AssignmentCorrectionEvent, NotFoundError } from '@uomlms/common';
import { Message } from 'node-rdkafka';
import { Submission } from '../../models/submission';

export class AssignmentCorrectionConsumer extends Consumer<AssignmentCorrectionEvent> {
  readonly topic = Topics.AssignmentCorrectionTopic;

  async onMessage(data: AssignmentCorrectionEvent['data'], message: Message) {
    const submission = await Submission.findById(data.submissionId);
    if (!submission) { throw new NotFoundError(); }

    submission.set({
      status: data.status,
      result: data.result
    });

    await submission.save();

  }
}