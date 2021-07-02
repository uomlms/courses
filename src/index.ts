import mongoose from 'mongoose';
import { app } from './app';
import { kafka } from '@uomlms/common';

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.KAFKA_URL) {
    throw new Error('KAFKA_URL must be defined');
  }
  if (!process.env.KAFKA_GROUP_ID) {
    throw new Error('KAFKA_GROUP_ID must be defined');
  }

  try {

    await kafka.connectProducer(
      process.env.KAFKA_URL,
    );

    process.on('SIGINT', () => kafka.producer.disconnect());
    process.on('SIGTERM', () => kafka.producer.disconnect());

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
