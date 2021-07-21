import { Producer, Topics, AssignmentSubmitEvent } from '@uomlms/common';

export class AssignmentSubmitProducer extends Producer<AssignmentSubmitEvent> {
  topic = Topics.AssignmentSubmitTopic;
}
