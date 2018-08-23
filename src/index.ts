import 'reflect-metadata';
import { createConnection } from 'typeorm';
// import { User } from "./entity/User";

import { GraphQLServer } from 'graphql-yoga';
import { ApolloEngine } from 'apollo-engine';
// tslint:disable-next-line
import * as cookieParser from 'cookie-parser';
import { isNil } from 'lodash';
import * as morgan from 'morgan';

// tslint:disable-next-line
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

import resolvers from './resolvers/index.resolvers';
import typeDefs from './schema/schema';
import scalars from './scalars/index.scalars';
import { auth } from './middlewares/auth.middleware';
import { applyMiddleware } from 'graphql-middleware';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';
import { userLoader } from './loaders/user.loaders';
import { ValidationDirective } from './directives/validation.directive';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: { validation: ValidationDirective }
});
const protectedSchema: any = applyMiddleware(schema, auth);

const server = new GraphQLServer({
  schema: protectedSchema,
  context: ({ request, response }) => {
    let token;
    if (!isNil(request.cookies.access_token)) {
      token = request.cookies.access_token;
    }
    return {
      response,
      token,
      userLoader: userLoader()
    };
  }
});

server.express.use(morgan('dev'));
server.express.use(cookieParser());

const db =
  process.env.NODE_ENV === 'test'
    ? 'test'
    : process.env.NODE_ENV === 'production'
      ? 'production'
      : 'default';

createConnection(db)
  .then(() => {
    console.log('connection to db established');

    if (process.env.ENGINE === 'true') {
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
  })
  .catch(error => console.log('test', error));
