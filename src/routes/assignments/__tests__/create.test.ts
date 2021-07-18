import request from 'supertest';
import { app } from '../../../app';
import { Assignment } from '../../../models/assignments';

const basePath = '/api/courses';

it('has a route handler listening to /api/courses/:courseId/assignments for post requests', async () => {
  const courseId = global.generateId();
  const path = `${basePath}/${courseId}/assignments`;
  const response = await request(app)
    .post(path)
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const courseId = global.generateId();
  const path = `${basePath}/${courseId}/assignments`;
  await request(app)
    .post(path)
    .send({})
    .expect(401)
});

it('returns a status 401 if the user has not role staff', async () => {
  const courseId = global.generateId();
  const path = `${basePath}/${courseId}/assignments`;
  await request(app)
    .post(path)
    .set('Cookie', global.signup())
    .send({})
    .expect(401);

  await request(app)
    .post(path)
    .set('Cookie', global.signup("other role"))
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in and has role staff', async () => {
  const courseId = global.generateId();
  const path = `${basePath}/${courseId}/assignments`;
  const response = await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid name is provided', async () => {
  const courseId = global.generateId();
  const path = `${basePath}/${courseId}/assignments`;
  await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: '',
      description: 'a description',
      semester: 1,
      deadline: '2021-07-07T23:12:11',
      type: "obligatory",
    })
    .expect(400);

  await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({
      description: 'a description',
      semester: 1,
      deadline: '2021-07-07T23:12:11',
      type: "obligatory",
    })
    .expect(400);
});

it('returns an error if an invalid description is provided', async () => {
  const courseId = global.generateId();
  const path = `${basePath}/${courseId}/assignments`;
  await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: '',
      semester: 1,
      deadline: '2021-07-07T23:12:11',
      type: "obligatory",
    })
    .expect(400);

  await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      semester: 1,
      deadline: '2021-07-07T23:12:11',
      type: "obligatory",
    })
    .expect(400);
});

it('returns an error if an invalid deadline is provided', async () => {
  const courseId = global.generateId();
  const path = `${basePath}/${courseId}/assignments`;
  await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 1,
      deadline: '',
      type: "obligatory",
    })
    .expect(400);

  const invalid_deadlines = [
    '20-02-2021T23:23:23', // dd-mm-yyyyThh:mm:ss
    '02-20-2021T23:23:23', // mm-dd-yyyyThh:mm:ss
    '02-2021-20T23:23:23', // mm-yyyy-ddThh:mm:ss
    '20-2021-02T23:23:23', // dd-yyyy-mmThh:mm:ss
    '2021-20-02T23:23:23', // yyyy-dd-mmThh:mm:ss
  ];

  for (const deadline in invalid_deadlines) {
    await request(app)
      .post(path)
      .set('Cookie', global.signup("staff"))
      .send({
        name: 'a name',
        description: 'a description',
        semester: 1,
        deadline: invalid_deadlines[deadline],
        type: "obligatory",
      })
      .expect(400);
  }

  await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 1,
      type: "obligatory",
    })
    .expect(400);
});

it('returns an error if an invalid type is provided', async () => {
  const courseId = global.generateId();
  const path = `${basePath}/${courseId}/assignments`;
  await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 1,
      deadline: '2021-07-07T23:12:11',
      type: "",
    })
    .expect(400);

  await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 1,
      deadline: '2021-07-07T23:12:11',
    })
    .expect(400);
});


it('returns error not found if course not exists', async () => {
  const courseId = global.generateId();
  const path = `${basePath}/${courseId}/assignments`;
  await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 1,
      deadline: '2021-07-07T23:12:11',
      type: "obligatory",
    })
    .expect(404);
});


it('creates an assignment with valid inputs', async () => {
  const course = await request(app)
    .post(basePath)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 12
    })
    .expect(201);

  let assignments = await Assignment.find({});
  expect(assignments.length).toEqual(0);

  const path = `${basePath}/${course.body.id}/assignments`;
  await request(app)
    .post(path)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      deadline: '2021-07-07T23:12:11',
      type: "obligatory",
    })
    .expect(201);

  assignments = await Assignment.find({});
  expect(assignments.length).toEqual(1);
});