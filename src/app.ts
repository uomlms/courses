import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@uomlms/common';
import { createCourseRouter } from './routes/courses/create';
import { updateCourseRouter } from './routes/courses/update';
import { getCoursesRouter } from './routes/courses/get';


const app = express();
app.set('trust proxy', true);
app.use(express.json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);

app.use(createCourseRouter);
app.use(updateCourseRouter);
app.use(getCoursesRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
