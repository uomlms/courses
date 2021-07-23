import request from 'supertest';
import { app } from '../../../app';
import { createCourse, createAssignment } from '../../../test/seed';

const basePath = '/api/courses';

it('has a route handler listening to /api/courses/:courseId/assignments/:id/submit for post requests', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}/submit`;
  const response = await request(app)
    .post(path)
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}/submit`;
  await request(app)
    .post(path)
    .send({})
    .expect(401);
});

it('returns a status 401 if the user has not role student', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}/submit`;
  await request(app)
    .post(path)
    .set('Cookie', global.signup("other role"))
    .send({})
    .expect(401);

  await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({})
    .expect(401);
});

it('returns error not found if course not exists', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}/submit`;
  await request(app)
    .post(path)
    .set('Cookie', global.signup())
    .send({})
    .expect(404);
});


it('returns a 404 if the assignment do not belong to course', async () => {
  const first_course = await createCourse();
  const second_course = await createCourse();

  const first_assignment = await createAssignment({ courseId: first_course.body.id })
  const second_assignment = await createAssignment({ courseId: second_course.body.id })

  await request(app)
    .post(`${basePath}/${first_course.body.id}/assignments/${second_assignment.body.id}/submit`)
    .set('Cookie', global.signup())
    .send({
      name: 'a name',
      description: 'a description',
      semester: 1,
      deadline: '2021-07-07T23:12:11',
      type: "obligatory",
    })
    .expect(404);

  await request(app)
    .post(`${basePath}/${second_course.body.id}/assignments/${first_assignment.body.id}/submit`)
    .set('Cookie', global.signup())
    .send({
      name: 'a name',
      description: 'a description',
      semester: 1,
      deadline: '2021-07-07T23:12:11',
      type: "obligatory",
    })
    .expect(404);
});

