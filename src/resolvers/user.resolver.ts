import * as faker from "faker";
import { IResolvers } from "graphql-tools";

const userResolver: IResolvers = {
  Query: {
    users: () => ({
      id: "1",
      username: faker.internet.userName(),
      email: faker.internet.email(),
      created: new Date().toTimeString(),
      lastUpdate: new Date().toTimeString()
    })
  }
};
export default userResolver;
