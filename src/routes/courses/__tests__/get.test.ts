import request from 'supertest';
import { app } from '../../../app';
import { createCourse } from '../../../test/seed';

const basePath = '/api/courses';

it('can only be accessed if the user is signed in', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  await request(app)
    .get(path)
    .send({})
    .expect(401)
});

it('can be accessed if the user is signed in without any role restriction.', async () => {
  // Student Role
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  let response = await request(app)
    .get(path)
    .set('Cookie', global.signup("student"))
    .send()

  expect(response.status).not.toEqual(401);

  // Staf Role
  response = await request(app)
    .get(path)
    .set('Cookie', global.signup("staff"))
    .send()

  expect(response.status).not.toEqual(401);

  // Other role
  response = await request(app)
    .get(path)
    .set('Cookie', global.signup("another role"))
    .send()

  expect(response.status).not.toEqual(401);
});

it('returns a 404 if the course is not found', async () => {
  const id = global.generateId();
  const path = `${basePath}/${id}`;
  await request(app)
    .get(path)
    .set('Cookie', global.signup())
    .send()
    .expect(404);
});


it('returns a course if the course is found', async () => {
  const name = 'a name';
  const description = 'a description';
  const semester = 3;

  const response = await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({ name, description, semester })
    .expect(201);

  const courseId = response.body.id;
  const courseResponse = await request(app)
    .get(`${basePath}/${courseId}`)
    .set('Cookie', global.signup())
    .send()
    .expect(200);


  expect(courseResponse.body.name).toEqual(name);
  expect(courseResponse.body.description).toEqual(description);
  expect(courseResponse.body.semester).toEqual(semester);
});



it('can fetch a list of courses', async () => {
  await createCourse();
  await createCourse();
  await createCourse();

  const response = await request(app)
    .get(basePath)
    .set('Cookie', global.signup())
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);
});