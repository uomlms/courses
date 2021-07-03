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

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post(basePath)
    .set('Cookie', global.signup())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid name is provided', async () => {
  await request(app)
    .post(basePath)
    .set('Cookie', global.signup())
    .send({
      name: '',
      description: 'a description'
    })
    .expect(400);

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup())
    .send({
      description: 'a description'
    })
    .expect(400);
});

it('returns an error if an invalid description is provided', async () => {
  await request(app)
    .post(basePath)
    .set('Cookie', global.signup())
    .send({
      name: 'a name',
      description: ''
    })
    .expect(400);

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup())
    .send({
      name: 'a name'
    })
    .expect(400);
});

it('returns an error if an invalid semester is provided', async () => {

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup())
    .send({
      name: 'a name',
      description: 'a description',
      semester: 13
    })
    .expect(400);

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup())
    .send({
      name: 'a name',
      description: 'a description',
      semester: 0
    })
    .expect(400);
});

it('creates a course with valid inputs', async () => {

  let courses = await Course.find({});
  expect(courses.length).toEqual(0);

  await request(app)
    .post(basePath)
    .set('Cookie', global.signup())
    .send({
      name: 'a name',
      description: 'a description',
      semester: 12
    })
    .expect(201);

  courses = await Course.find({});
  expect(courses.length).toEqual(1);
});