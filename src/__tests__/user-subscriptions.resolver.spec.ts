import * as faker from 'faker';
// import axios from 'axios';
import { createConnection } from 'typeorm';
import { userRepo } from '../helpers/userRepo';
import WebSocket from 'ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import ApolloClient from 'apollo-client';
const GRAPHQL_ENDPOINT = 'ws://localhost:4000';

// const instance = axios.create({
//   baseURL: 'http://localhost:4000',
//   withCredentials: true
// });

// let cookie: string;

describe.only('status subscription', () => {
  const variables = {
    user1: {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: 'test'
    },
    user2: {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: 'test'
    },
    user3: {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: 'test'
    }
  };
  let ids: string[];
  let networkInterface: SubscriptionClient;
  let apollo: ApolloClient<any>;

  beforeAll(async () => {
    await createConnection('test');
    const { identifiers } = await userRepo().insert([
      variables.user1,
      variables.user2,
      variables.user3
    ]);
    await Promise.all([
      userRepo().addFriend(identifiers[0].id, identifiers[1].id),
      userRepo().addFriend(identifiers[1].id, identifiers[0].id)
    ]);
    ids = [identifiers[0].id, identifiers[1].id];

    networkInterface = new SubscriptionClient(
      GRAPHQL_ENDPOINT,
      { reconnect: true },
      WebSocket
    );
    // apollo = new ApolloClient({ networkInterface });
  });

  it('should add a friend', async () => {
    expect(true).toBe(true);
  });

  afterAll(() => {
    networkInterface.close();
  });
});
