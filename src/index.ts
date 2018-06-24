import 'reflect-metadata';
import { createConnection } from 'typeorm';
// import { User } from "./entity/User";

import { GraphQLServer } from 'graphql-yoga';
import { ApolloEngine } from 'apollo-engine';
// tslint:disable-next-line
import * as cookieParser from "cookie-parser";
import { isNil } from 'lodash';

// tslint:disable-next-line
require("dotenv").config();

import resolvers from './resolvers/index.resolvers';
import typeDefs from './schema/schema';

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: ({ request, response }) => {
    let token;
    console.log(request.cookies);
    if (!isNil(request.cookies.access_token)) {
      token = request.cookies.access_token;
    }
    return {
      response,
      token
    };
  }
});

server.express.use(cookieParser());

if (process.env.ENGINE) {
  const engine = new ApolloEngine({
    apiKey: process.env.APOLLO_ENGINE_KEY
  });

  const httpServer = server.createHttpServer({
    tracing: true,
    cacheControl: true
  });

  engine.listen(
    {
      port: 4000,
      httpServer,
      graphqlPaths: ['/']
    },
    () =>
      console.log(
        `Server with Apollo Engine is running on http://localhost:4000`
      )
  );
} else {
  server.start(() => console.log('Server is running on localhost:4000'));
}

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
    console.log('connection to db established');
  })
  .catch(error => console.log(error));
