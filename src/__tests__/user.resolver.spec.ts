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

describe('user logic flow', () => {
  let variables: any;
  beforeAll(() => {
    variables = {
      email: faker.internet.email(),
      username: faker.internet.userName()
    };
  });
  it('should register user', async done => {
    const registerMutation = `
      mutation($email: String!, $username: String!) {
        register(email: $email, username: $username, password: "test") {
          email,
          username
        }
      }`;
    const registered = await instance.post('/', {
      query: registerMutation,
      variables
    });
    expect(registered.data.data).toEqual({ register: variables });
    done();
  });

  it('should not register user for duplicate email', async done => {
    const registerMutation = `
      mutation($email: String!, $username: String!) {
        register(email: $email, username: $username, password: "test") {
          email,
          username
        }
      }`;
    try {
      await instance.post('/', { query: registerMutation, variables });
    } catch (e) {
      expect(e.response.data.register).toBeNull();
      expect(e.response.errors[0].message).toBe('Duplicate email existing');
    }
    done();
  });

  it('should login user', async done => {
    const loginMutation = `
      mutation($email: String!) {
        login(email: $email, password: "test") {
          email,
          username,
          status
        }
      }`;
    const logined = await instance.post('/', {
      variables,
      query: loginMutation
    });
    expect(logined.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(logined.headers['set-cookie'][0]).toContain('access_token');
    cookie = logined.headers['set-cookie'][0];
    expect(logined.data.data).toEqual({
      login: { ...variables, status: 'active' }
    });
    done();
  });

  it('should show the user if authenticated', async done => {
    const registerMutation = `
      query ($username: String) {
        user(username: $username) {
          username,
          email
        }
      }
      `;
    const registered = await instance.post(
      '/',
      {
        variables,
        query: registerMutation
      },
      { headers: { Cookie: cookie } }
    );
    expect(registered.data.data).toEqual({ user: variables });
    done();
  });

  it('should logout user', async done => {
    const logoutMutation = `
      mutation ($email: String!) {
        logout(email: $email)
      }
      `;
    const loggedOut = await instance.post(
      '/',
      {
        variables,
        query: logoutMutation
      },
      { headers: { Cookie: cookie } }
    );
    expect(loggedOut.headers['set-cookie'][0]).toContain('Thu, 01 Jan 1970');
    expect(loggedOut.data.data).toEqual({ logout: 'logged out' });
    done();
  });

  it('should not show the user if not authenticated', async done => {
    const registerMutation = `
      query ($username: String) {
        user(username: $username) {
          username,
          email
        }
      }
      `;
    try {
      await instance.post('/', { query: registerMutation, variables });
    } catch (err) {
      console.log(err);
      expect(err).toBeDefined();
    }
    done();
  });
});

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
