import { createConnection, Connection } from 'typeorm';
import { userRepo } from '../helpers/userRepo';

import { TestGenerator } from './mocking/test.generator';
import { User } from '../entity/User';

describe('user repo custom methods', () => {
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
  });

  it('should add a friend', async () => {
    await userRepo().addFriend(User1.id, User2.id);
    const user = await userRepo().findOne(User2.id);
    expect(user!.friends.includes(User1.id)).toBe(true);
  });

  it('should find friends', async () => {
    const users = await userRepo().findFriends([User1.id]);
    expect(users).toContainEqual(User1);
  });

  afterAll(async () => {
    await connection.close();
  });
});
