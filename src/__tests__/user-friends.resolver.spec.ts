import axios from 'axios';
import { createConnection, Connection } from 'typeorm';
import { userRepo } from '../helpers/userRepo';
import { conversationRepo } from '../helpers/conversationRepo';
import { User } from '../entity/User';
import { TestGenerator } from './mocking/test.generator';

const instance = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true
});

let cookie: string;

describe('add friends', () => {
  const variables = {
    user1: TestGenerator.generateUserVariables(),
    user2: TestGenerator.generateUserVariables()
  };
  let User1: User;
  let User2: User;
  let connection: Connection;
  beforeAll(async () => {
    connection = await createConnection('test');

    const user1 = TestGenerator.newUser(
      variables.user1.email,
      variables.user1.username
    );
    const user2 = TestGenerator.newUser(
      variables.user2.email,
      variables.user2.username
    );

    [User1, User2] = await Promise.all([
      userRepo().save(user1),
      userRepo().save(user2)
    ]);

    const loginMutation = `
      mutation($email: String!) {
        login(email: $email, password: "test") {
          email,
          username,
          status
        }
      }`;
    const resp = await instance.post('/', {
      variables: {
        email: User1.email,
        password: 'test'
      },
      query: loginMutation
    });
    cookie = resp.headers['set-cookie'][0];
  });

  it('should add a friend', async () => {
    const addFriendMutation = `
      mutation($id: ID!) {
        addFriend(id: $id) {
          friends {
            email
          }
        }
      }`;

    const friends = await instance.post(
      '/',
      {
        variables: {
          id: User2.id
        },
        query: addFriendMutation
      },
      { headers: { Cookie: cookie } }
    );

    expect(friends.data.data.addFriend.friends).toContainEqual({
      email: User2.email
    });
    const user = await userRepo().findOne({ id: User2.id });
    expect((user as User).friends).toContain(User1.id);
    const conversation = await conversationRepo()
      .createQueryBuilder('conversation')
      .where(':id = ANY(users)', { id: User1.id })
      .getOne();
    expect(conversation!.users).toContain(User1.id);
    expect(conversation!.users).toContain(User2.id);
  });

  it('should not add existing friend', async () => {
    const addFriendMutation = `
      mutation($id: ID!) {
        addFriend(id: $id) {
           friends {
             email
           }
        }
      }`;

    const friends = await instance.post(
      '/',
      {
        variables: {
          id: User2.id
        },
        query: addFriendMutation
      },
      { headers: { Cookie: cookie } }
    );
    expect(friends.data.data.addFriend.friends).toContainEqual({
      email: User2.email
    });
    const user = await userRepo().findOne({ id: User2.id });
    expect(user!.friends).toContain(User1.id);
  });

  afterAll(async () => {
    await connection.close();
  });
});
