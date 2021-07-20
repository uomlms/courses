import request from 'supertest';
import { app } from '../../../app';
import { Assignment } from '../../../models/assignments';
import { createCourse, createAssignment } from '../../../test/seed';

const basePath = '/api/courses';

it('has a route handler listening to /api/courses/:courseId/assignments/:id for patch requests', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;
  const response = await request(app)
    .patch(path)
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;
  await request(app)
    .patch(path)
    .send({})
    .expect(401)
});

it('returns a status 401 if the user has not role staff', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;
  await request(app)
    .patch(path)
    .set('Cookie', global.signup())
    .send({})
    .expect(401);

  await request(app)
    .patch(path)
    .set('Cookie', global.signup("other role"))
    .send({})
    .expect(401);
});

it('returns an error if an invalid name is provided', async () => {
  const courseId = global.generateId();
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;
  await request(app)
    .patch(path)
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
    .patch(path)
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
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;
  await request(app)
    .patch(path)
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
    .patch(path)
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
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;
  await request(app)
    .patch(path)
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
      .patch(path)
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
    .patch(path)
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
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;
  await request(app)
    .patch(path)
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
    .patch(path)
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
  const assignmentId = global.generateId();
  const path = `${basePath}/${courseId}/assignments/${assignmentId}`;
  await request(app)
    .patch(path)
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

it('returns a 404 if the assignment do not belong to course', async () => {
  const first_course = await createCourse();

  const second_course = await createCourse();

  const first_assignment = await createAssignment({ courseId: first_course.body.id })
  const second_assignment = await createAssignment({ courseId: second_course.body.id })

  await request(app)
    .patch(`${basePath}/${first_course.body.id}/assignments/${second_assignment.body.id}`)
    .set('Cookie', global.signup("staff"))
    .send({
      name: 'a name',
      description: 'a description',
      semester: 1,
      deadline: '2021-07-07T23:12:11',
      type: "obligatory",
    })
    .expect(404);

  await request(app)
    .patch(`${basePath}/${second_course.body.id}/assignments/${first_assignment.body.id}`)
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

it('updates an assignment with valid inputs', async () => {
  const course = await createCourse();

  let assignments = await Assignment.find({});
  expect(assignments.length).toEqual(0);

  const assignment = await createAssignment({ courseId: course.body.id })

  assignments = await Assignment.find({});
  expect(assignments.length).toEqual(1);

  const updateAssignmentPath = `${basePath}/${course.body.id}/assignments/${assignment.body.id}`;
  const data = {
    name: 'an updated name',
    description: 'an updated description',
    deadline: '2021-08-07T23:12:11',
    type: "optional",
    status: "inactive"
  };

  const updateAssignmentResponse = await request(app)
    .patch(updateAssignmentPath)
    .set('Cookie', global.signup("staff"))
    .send(data)
    .expect(200);

  expect(updateAssignmentResponse.body.name).toEqual(data.name);
  expect(updateAssignmentResponse.body.description).toEqual(data.description);
  expect(updateAssignmentResponse.body.deadline).toEqual(new Date(data.deadline).toISOString());
  expect(updateAssignmentResponse.body.type).toEqual(data.type);
  expect(updateAssignmentResponse.body.status).toEqual(data.status);
});