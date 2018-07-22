import { createConnection } from 'typeorm';
import { User } from './src/entity/User';
import * as faker from 'faker';
import { userRepo } from './src/helpers/userRepo';

createConnection().then(async () => {
  const users: User[] = [];
  await Promise.all(
    Array.from(Array(10)).map(async (_, index) => {
      const user = new User();
      user.username = faker.internet.userName();
      user.email = `test${index}@test.com`;
      user.password = 'test';
      const created = await userRepo().save(user);
      users.push(created);
    })
  );
  users[0].friends = [users[1].id, users[2].id, users[3].id, users[9].id];
  users[1].friends = [users[0].id, users[2].id, users[3].id];
  users[2].friends = [users[0].id, users[1].id, users[2].id];
  users[9].friends = [users[0].id];
  await Promise.all(
    users.map(async user => {
      await userRepo().update({ id: user.id }, { friends: user.friends });
    })
  );
});
