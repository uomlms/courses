import { connectDB } from '../config/db';
import { app } from './app';
import { kafka } from '@uomlms/common';

import dotenv from 'dotenv';
import { resolve } from "path"

dotenv.config({ path: resolve(__dirname, "../config/config.env") });

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
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error('AWS_ACCESS_KEY_ID must be defined');
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_SECRET_ACCESS_KEY must be defined');
  }
  if (!process.env.AWS_BUCKET) {
    throw new Error('AWS_BUCKET must be defined');
  }

  try {

    await kafka.connectProducer(
      process.env.KAFKA_URL,
    );

    process.on('SIGINT', () => kafka.producer.disconnect());
    process.on('SIGTERM', () => kafka.producer.disconnect());

    await connectDB();
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
