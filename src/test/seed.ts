import request from 'supertest';
import { app } from '../app';

const createCourse = (
  cookie: string[] = global.signup("staff"),
  data: any = {
    name: "a name",
    description: "a description",
    semester: 3
  }) => {
  const path = '/api/courses';
  return request(app)
    .post(path)
    .set('Cookie', cookie)
    .send(data)
    .expect(201);
};


interface AssignmentParameters {
  courseId: string;
  data?: any;
  cookie?: string[];
}
const createAssignment = ({
  courseId,
  data = {
    name: 'a name',
    description: 'a description',
    deadline: '2021-07-07T23:12:11',
    type: "obligatory"
  },
  cookie = global.signup("staff")
}: AssignmentParameters) => {

  const path = `/api/courses/${courseId}/assignments`;
  return request(app)
    .post(path)
    .set('Cookie', cookie)
    .send(data)
    .expect(201);
}

export { createCourse, createAssignment }