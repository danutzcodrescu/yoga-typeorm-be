import * as faker from "faker";
import { IResolvers } from "graphql-tools";
import { User as UserModel } from "../entity/User";
import { User } from "../../types/schemas/types";
import { getRepository } from "typeorm";

const userResolver: IResolvers = {
  Query: {
    users: () => ({
      id: "1",
      username: faker.internet.userName(),
      email: faker.internet.email(),
      created: new Date().toTimeString(),
      lastUpdate: new Date().toTimeString()
    })
  },

  Mutation: {
    register: (_, { email, username, password }: User) => {
      const userRepository = getRepository(UserModel);
      const user = new UserModel();
      user.email = email;
      user.password = password;
      user.username = username;
      return userRepository.save(user);
    }
  }
};
export default userResolver;
