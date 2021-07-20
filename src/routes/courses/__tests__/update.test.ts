import request from 'supertest';
import { app } from '../../../app';
import { createCourse } from '../../../test/seed';

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

it('returns an error if an invalid description is provided', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  await request(app)
    .patch(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: '',
      semester: 12
    })
    .expect(400);

  await request(app)
    .patch(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      semester: 12
    })
    .expect(400);
});


it('returns an error if an invalid semester is provided', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  await request(app)
    .patch(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 13
    })
    .expect(400);

  await request(app)
    .patch(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 0
    })
    .expect(400);

  await request(app)
    .patch(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description'
    })
    .expect(400);

  await request(app)
    .patch(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: ''
    })
    .expect(400);
});


it('updates a course with valid inputs', async () => {
  const course = await createCourse();

  await request(app)
    .patch(`${basePath}/${course.body.id}`)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a different name',
      description: 'a different description',
      semester: 2
    })
    .expect(200);

  const updateCourseResponse = await request(app)
    .get(`${basePath}/${course.body.id}`)
    .set('Cookie', global.signup("staff"))
    .send()
    .expect(200);

  expect(updateCourseResponse.body.name).toEqual('a different name');
  expect(updateCourseResponse.body.description).toEqual('a different description');
  expect(updateCourseResponse.body.semester).toEqual(2);
});