import request from 'supertest';
import { app } from '../../../app';
import { Assignment } from '../../../models/assignments';
import { Course } from '../../../models/courses';
import { createAssignmentRouter } from '../create';

const basePath = '/api/courses';

it('has a route handler listening to /api/courses/ for delete requests', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;

  const response = await request(app)
    .delete(path)
    .send();

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;
  await request(app)
    .delete(path)
    .send()
    .expect(401)
});

it('returns a status 401 if the user has not role staff', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;
  await request(app)
    .delete(path)
    .set('Cookie', global.signup())
    .send()
    .expect(401);

  await request(app)
    .delete(path)
    .set('Cookie', global.signup("other role"))
    .send()
    .expect(401);
});


it('returns a status other than 401 if the user is signed in and has role staff', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;

  const response = await request(app)
    .delete(path)
    .set('Cookie', global.signup("staff"))
    .send();

  expect(response.status).not.toEqual(401);
});


it('deletes an assignment', async () => {
  const createCourseResponse = await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: "a name",
      description: "a description",
      semester: 3
    })
    .expect(201);

  const courses = await Course.find({});
  expect(courses.length).toEqual(1);

  const courseId = createCourseResponse.body.id;
  const createAssignmentPath = `${basePath}/${courseId}/assignments`;
  const createAssignmentResponse = await request(app)
    .post(createAssignmentPath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      deadline: '2021-07-07T23:12:11',
      type: "obligatory",
    })
    .expect(201);

  let assignments = await Assignment.find({});
  expect(assignments.length).toEqual(1);

  const deleteAssignmentPath = `${basePath}/${courseId}/assignments/${createAssignmentResponse.body.id}`;
  await request(app)
    .delete(deleteAssignmentPath)
    .set('Cookie', global.signup("staff"))
    .send()
    .expect(200);

  assignments = await Assignment.find({});
  expect(assignments.length).toEqual(0);
});