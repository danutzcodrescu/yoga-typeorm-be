import axios from 'axios';
import { TestGenerator } from './mocking/test.generator';

const instance = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true
});

let cookie: string;

describe('user logic flow', () => {
  let variables: any;
  beforeAll(() => {
    variables = TestGenerator.generateUserVariables();
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
