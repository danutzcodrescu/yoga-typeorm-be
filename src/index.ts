import "reflect-metadata";
import { createConnection } from "typeorm";
// import { User } from "./entity/User";

import { GraphQLServer } from "graphql-yoga";
// import { ApolloEngine } from "apollo-engine";
// tslint:disable-next-line
import * as cookieParser from "cookie-parser";
import { isNil } from "lodash";

// tslint:disable-next-line
require("dotenv").config();

import resolvers from "./resolvers/index.resolvers";
import typeDefs from "./schema/schema";

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: ({ request, response }) => {
    let token;
    if (!isNil(request.cookies.access_token)) {
      token = request.cookies.access_token;
    }
    return {
      response,
      token
    };
  }
});

// const engine = new ApolloEngine({
//     apiKey: 'service:danutzcodrescu-9658:WkAUrgrGg4zwqjo6KM3Q2w'
// });

// server.express.use(
//   session({
//     name: "access_token",
//     secret: process.env.SECRET_COOKIE,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       maxAge: ms("1d"),
//       httpOnly: true
//     }
//   })
// );
server.express.use(cookieParser());
server.start(() => console.log("Server is running on localhost:4000"));

createConnection()
  .then(() => {
    // console.log("Inserting a new user into the database...");
    // const user = new User();

    // user.username = "test2";
    // user.password = "sasa";
    // user.email = "test2@test.com";
    // await connection.manager.save(user);
    // console.log("Saved a new user with id: " + user.id);

    // console.log("Loading users from the database...");
    // const users = await connection.manager.find(User);
    // console.log("Loaded users: ", users);

    // console.log("Here you can setup and run express/koa/any other framework.");
    console.log("connection to db established");
  })
  .catch(error => console.log(error));
