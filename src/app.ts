import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import swaggerUi from 'swagger-ui-express';
import docs from '../docs/docs.json';
import { errorHandler, NotFoundError, currentUser } from '@uomlms/common';
import { createCourseRouter } from './routes/courses/create';
import { updateCourseRouter } from './routes/courses/update';
import { getCoursesRouter } from './routes/courses/get';
import { deleteCourseRouter } from './routes/courses/delete';
import { assignmentActionsRouter } from './routes/assignments/actions';


const app = express();

app.use('/api/courses/docs', swaggerUi.serve, swaggerUi.setup(docs));

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
app.use(deleteCourseRouter);

app.use(assignmentActionsRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
