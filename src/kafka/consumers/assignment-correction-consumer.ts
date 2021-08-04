import { Consumer, Topics, AssignmentCorrectionEvent } from '@uomlms/common';
import { Message } from 'node-rdkafka';

export class AssignmentCorrectionConsumer extends Consumer<AssignmentCorrectionEvent> {
    readonly topic = Topics.AssignmentCorrectionTopic;

    onMessage(data: AssignmentCorrectionEvent['data'], message: Message) {
        console.log("Message Received: " + this.topic);
        console.log(data);
    }
}