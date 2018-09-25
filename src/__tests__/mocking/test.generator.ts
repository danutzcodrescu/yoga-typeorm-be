import { User } from '../../entity/User';
import * as faker from 'faker';

export class TestGenerator {
  static newUser(email: string, username: string) {
    const user = new User();
    user.email = email;
    user.username = username;
    user.password = 'test';
    return user;
  }

  static generateUserVariables() {
    return {
      email: faker.internet.email(),
      username: faker.internet.userName()
    };
  }
}
