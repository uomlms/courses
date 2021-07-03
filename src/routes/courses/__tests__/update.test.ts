import request from 'supertest';
import { app } from '../../../app';
import { Course } from '../../../models/courses';

const basePath = '/api/courses';

it('has a route handler listening to /api/courses for patch requests', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  const response = await request(app)
    .patch(path)
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  await request(app)
    .patch(path)
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  const response = await request(app)
    .patch(path)
    .set('Cookie', global.signup())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid name is provided', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  await request(app)
    .patch(path)
    .set('Cookie', global.signup())
    .send({
      name: '',
      description: 'a description',
      semester: 1
    })
    .expect(400);

  await request(app)
    .patch(path)
    .set('Cookie', global.signup())
    .send({
      description: 'a description',
      semester: 1
    })
    .expect(400);
});


