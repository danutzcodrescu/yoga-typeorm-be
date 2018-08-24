import * as faker from 'faker';
import axios from 'axios';
import { createConnection } from 'typeorm';
import { userRepo } from '../helpers/userRepo';
import { User } from '../entity/User';

const instance = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true
});

let cookie: string;

describe('add friends', () => {
  const variables = {
    user1: {
      email: faker.internet.email(),
      username: faker.internet.userName()
    },
    user2: {
      email: faker.internet.email(),
      username: faker.internet.userName()
    }
  };
  let User1: User;
  let User2: User;
  beforeAll(async () => {
    await createConnection('test');

    const user1 = new User();
    user1.email = variables.user1.email;
    user1.username = variables.user1.username;
    user1.password = 'test';

    const user2 = new User();
    user2.email = variables.user2.email;
    user2.username = variables.user2.username;
    user2.password = 'test';

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
      mutation($id: String!) {
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
    expect(user.friends).toContain(User1.id);
  });

  it('should not existing friend', async () => {
    const addFriendMutation = `
      mutation($id: String!) {
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
    expect(user.friends).toContain(User1.id);
  });
});
