import request from 'supertest';
import { app } from '../../../app';
import { Assignment } from '../../../models/assignments';
import { Course } from '../../../models/courses';
import { createCourse, createAssignment } from '../../../test/seed';

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

it('returns a 404 if the assignment do not belong to course', async () => {
  const first_course = await createCourse();

  const second_course = await createCourse();

  const first_assignment = await createAssignment({ courseId: first_course.body.id })
  const second_assignment = await createAssignment({ courseId: second_course.body.id })

  await request(app)
    .delete(`${basePath}/${first_course.body.id}/assignments/${second_assignment.body.id}`)
    .set('Cookie', global.signup("staff"))
    .send()
    .expect(404);

  await request(app)
    .delete(`${basePath}/${second_course.body.id}/assignments/${first_assignment.body.id}`)
    .set('Cookie', global.signup("staff"))
    .send()
    .expect(404);
});

it('deletes an assignment', async () => {
  const course = await createCourse();

  const courses = await Course.find({});
  expect(courses.length).toEqual(1);

  const createAssignmentResponse = await createAssignment({ courseId: course.body.id });

  let assignments = await Assignment.find({});
  expect(assignments.length).toEqual(1);

  const deleteAssignmentPath = `${basePath}/${course.body.id}/assignments/${createAssignmentResponse.body.id}`;
  await request(app)
    .delete(deleteAssignmentPath)
    .set('Cookie', global.signup("staff"))
    .send()
    .expect(200);

  assignments = await Assignment.find({});
  expect(assignments.length).toEqual(0);
});