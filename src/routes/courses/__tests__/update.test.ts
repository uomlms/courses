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

it('returns a status 401 if the user has not role staff', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  await request(app)
    .patch(path)
    .set('Cookie', global.signup())
    .send({
      name: 'a title',
      description: 'a description',
      semester: 1
    })
    .expect(401);

  await request(app)
    .patch(path)
    .set('Cookie', global.signup("other role"))
    .send({
      name: 'a title',
      description: 'a description',
      semester: 1
    })
    .expect(401);
});

it('returns a status other than 401 if the user is signed in and has role staff', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  const response = await request(app)
    .patch(path)
    .set('Cookie', global.signup("staff"))
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid name is provided', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  await request(app)
    .patch(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: '',
      description: 'a description',
      semester: 1
    })
    .expect(400);

  await request(app)
    .patch(path)
    .set('Cookie', global.signup("staff"))
    .send({
      description: 'a description',
      semester: 1
    })
    .expect(400);
});


