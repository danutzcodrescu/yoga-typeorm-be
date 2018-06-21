import "reflect-metadata";
import { createConnection } from "typeorm";
// import {User} from "./entity/User";

import { GraphQLServer } from "graphql-yoga";

import resolvers from "./resolvers/index.resolvers";
import typeDefs from "./schema/schema";

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost:4000"));

createConnection()
  .then(() => {
    //     console.log("Inserting a new user into the database...");
    //     const user = new User();
    //     user.firstName = "Timber";
    //     user.lastName = "Saw";
    //     user.age = 25;
    //     await connection.manager.save(user);
    //     console.log("Saved a new user with id: " + user.id);

    //     console.log("Loading users from the database...");
    //     const users = await connection.manager.find(User);
    //     console.log("Loaded users: ", users);

    //     console.log("Here you can setup and run express/koa/any other framework.");
    console.log("connection to db established");
  })
  .catch(error => console.log(error));
