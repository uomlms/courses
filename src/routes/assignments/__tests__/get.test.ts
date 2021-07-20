import request from 'supertest';
import { app } from '../../../app';
import { createCourse, createAssignment } from '../../../test/seed';

const basePath = '/api/courses';

it('has a route handler listening to /api/courses/:courseId/assignments for get requests', async () => {
  const courseId = global.generateId();
  const path = `${basePath}/${courseId}/assignments`;
  const response = await request(app)
    .get(path)
    .send({});

  expect(response.status).not.toEqual(404);
});

it('has a route handler listening to /api/courses/:courseId/assignments/:id for get requests', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;
  const response = await request(app).get(path);

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const paths = [
    `${basePath}/${courseId}/assignments`,
    `${basePath}/${courseId}/assignments/${assignmentId}`
  ];

  for (const pathIndex in paths) {
    const path = paths[pathIndex];
    await request(app)
      .get(path)
      .expect(401)
  }
});

it('can be accessed if the user is signed in without any role restriction.', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const paths = [
    `${basePath}/${courseId}/assignments`,
    `${basePath}/${courseId}/assignments/${assignmentId}`
  ];

  for (const pathIndex in paths) {
    const path = paths[pathIndex];
    // Student Role
    let response = await request(app)
      .get(path)
      .set('Cookie', global.signup())
      .send();

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
  }
});

it('returns a 404 if the course is not found', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const paths = [
    `${basePath}/${courseId}/assignments`,
    `${basePath}/${courseId}/assignments/${assignmentId}`
  ];
  for (const pathIndex in paths) {
    const path = paths[pathIndex];
    await request(app)
      .get(path)
      .set('Cookie', global.signup())
      .send()
      .expect(404);
  }
});

it('returns a 404 if the assignment do not belong to course', async () => {
  const first_course = await createCourse();
  const second_course = await createCourse();

  const first_assignment = await createAssignment({ courseId: first_course.body.id })
  const second_assignment = await createAssignment({ courseId: second_course.body.id })

  await request(app)
    .get(`${basePath}/${first_course.body.id}/assignments/${second_assignment.body.id}`)
    .set('Cookie', global.signup())
    .send()
    .expect(404);

  await request(app)
    .get(`${basePath}/${second_course.body.id}/assignments/${first_assignment.body.id}`)
    .set('Cookie', global.signup())
    .send()
    .expect(404);
});

it('returns an asignment if the asignment is found', async () => {
  const course = await createCourse();

  const data = {
    name: 'a name',
    description: 'a description',
    deadline: '2021-07-07T23:12:11',
    type: 'obligatory'
  }

  const assignment = await createAssignment({
    courseId: course.body.id,
    data: data
  });

  const getAssignmentPath = `${basePath}/${course.body.id}/assignments/${assignment.body.id}`;
  const assignmentResponse = await request(app)
    .get(getAssignmentPath)
    .set('Cookie', global.signup())
    .send()
    .expect(200);


  expect(assignmentResponse.body.name).toEqual(data.name);
  expect(assignmentResponse.body.description).toEqual(data.description);
  expect(assignmentResponse.body.deadline).toEqual(new Date(data.deadline).toISOString());
  expect(assignmentResponse.body.type).toEqual(data.type);
});