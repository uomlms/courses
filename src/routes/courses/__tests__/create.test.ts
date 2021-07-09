import request from 'supertest';
import { app } from '../../../app';
import { Course } from '../../../models/courses';

const basePath = '/api/courses';

it('has a route handler listening to /api/courses for post requests', async () => {
  const response = await request(app)
    .post(basePath)
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app)
    .post(basePath)
    .send({})
    .expect(401)
});

it('returns a status 401 if the user has not role staff', async () => {
  await request(app)
    .post(basePath)
    .set('Cookie', global.signup())
    .send({
      name: 'a title',
      description: 'a description',
      semester: 1
    })
    .expect(401);

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup("other role"))
    .send({
      name: 'a title',
      description: 'a description',
      semester: 1
    })
    .expect(401);
});

it('returns a status other than 401 if the user is signed in and has role staff', async () => {
  const response = await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid name is provided', async () => {
  await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: '',
      description: 'a description',
      semester: 12
    })
    .expect(400);

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      description: 'a description',
      semester: 12
    })
    .expect(400);
});

it('returns an error if an invalid description is provided', async () => {
  await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: '',
      semester: 12
    })
    .expect(400);

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      semester: 12
    })
    .expect(400);
});

it('returns an error if an invalid semester is provided', async () => {

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 13
    })
    .expect(400);

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 0
    })
    .expect(400);

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description'
    })
    .expect(400);

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: ''
    })
    .expect(400);
});



it('creates a course with valid inputs', async () => {
  let courses = await Course.find({});
  expect(courses.length).toEqual(0);

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 12
    })
    .expect(201);

  courses = await Course.find({});
  expect(courses.length).toEqual(1);
});