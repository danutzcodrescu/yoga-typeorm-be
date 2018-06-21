import * as faker from "faker";
export default {
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
