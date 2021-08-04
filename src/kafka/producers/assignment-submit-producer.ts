import { Producer, Topics, AssignmentSubmitEvent } from '@uomlms/common';

export class AssignmentSubmitProducer extends Producer<AssignmentSubmitEvent> {
  readonly topic = Topics.AssignmentSubmitTopic;
}
