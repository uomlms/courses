import request from 'supertest';
import { app } from '../../../app';
import { createCourse, createAssignment } from '../../../test/seed';
import { Course } from '../../../models/courses';
import { Assignment } from '../../../models/assignments';

const basePath = '/api/courses';

it('has a route handler listening to /api/courses for delete requests', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;

  const response = await request(app)
    .delete(path)
    .send();

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  await request(app)
    .delete(path)
    .send()
    .expect(401);
});


it('returns a status 401 if the user has not role staff', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
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
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  const response = await request(app)
    .delete(path)
    .set('Cookie', global.signup("staff"))
    .send();

  expect(response.status).not.toEqual(401);
});


it('deletes a course', async () => {
  const createResponse = await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: "a name",
      description: "a description",
      semester: 3
    })
    .expect(201);


  let getResponse = await request(app)
    .get(basePath)
    .set('Cookie', global.signup())
    .send()
    .expect(200);

  expect(getResponse.body.length).toEqual(1);

  await request(app)
    .delete(`${basePath}/${createResponse.body.id}`)
    .set('Cookie', global.signup("staff"))
    .send();

  getResponse = await request(app)
    .get(basePath)
    .set('Cookie', global.signup())
    .send()
    .expect(200);

  expect(getResponse.body.length).toEqual(0);
});

it('deletes a course and its assignments', async () => {
  const course = await createCourse();

  let courses = await Course.find({});
  expect(courses.length).toEqual(1);

  const assignment = await createAssignment({ courseId: course.body.id });

  let assignments = await Assignment.find({});
  expect(assignments.length).toEqual(1);

  await request(app)
    .delete(`${basePath}/${course.body.id}`)
    .set('Cookie', global.signup("staff"))
    .send()
    .expect(200);

  courses = await Course.find({});
  expect(courses.length).toEqual(0);

  assignments = await Assignment.find({});
  expect(assignments.length).toEqual(0);

});