import { GraphQLClient } from 'graphql-request';
import * as faker from 'faker';
// tslint:disable
(global as any)["fetch"] = require("fetch-cookie/node-fetch")(
  require("node-fetch")
);
// tslint:enable

const client = new GraphQLClient('http://localhost:4000');

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
    const registered = await client.request(registerMutation, variables);
    expect(registered).toEqual({ register: variables });
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
      await client.request(registerMutation, variables);
    } catch (e) {
      expect(e.response.data.register).toBeNull();
      expect(e.response.errors[0].message).toBe('Duplicate email existing');
    }
    done();
  });

  it('should login user', async done => {
    const registerMutation = `
      mutation($email: String!) {
        login(email: $email, password: "test") {
          email,
          username
        }
      }`;
    const registered = await client.rawRequest(registerMutation, variables);
    expect(registered.headers.get('set-cookie')).toContain('HttpOnly');
    expect(registered.headers.get('set-cookie')).toContain('access_token');
    expect(registered.data).toEqual({ login: variables });
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
    const registered = await client.request(registerMutation, variables);
    expect(registered).toEqual({ user: variables });
    done();
  });

  it('should logout user', async done => {
    const registerMutation = `
      mutation ($email: String!) {
        logout(email: $email)
      }
      `;
    try {
      const registered = await client.rawRequest(registerMutation, variables);
      expect(registered).toEqual({ logout: 'logged out' });
    } catch (e) {
      console.log(e);
    }
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
    client.request(registerMutation, variables).catch(err => {
      expect(err).toBeDefined();
      done();
    });
  });
});
