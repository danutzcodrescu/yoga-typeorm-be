import { IResolvers } from "graphql-tools";
import { User as UserModel } from "../entity/User";
import { User } from "../../types/schemas/types";
import { getRepository } from "typeorm";
import { isNil } from "lodash";
import { ApolloError } from "apollo-errors";
import * as argon from "argon2";
import { Response, Request } from "express";

const userResolver: IResolvers = {
  Query: {
    users: () => getRepository(UserModel).find(),
    user: (_, { email, username }: User) => {
      return getRepository(UserModel)
        .createQueryBuilder("user")
        .where("user.email = :email OR user.username = :username", {
          email,
          username
        })
        .getOne();
    }
  },

  Mutation: {
    register: (_, { email, username, password }: User) => {
      const user = new UserModel();
      user.email = email;
      user.password = password;
      user.username = username;
      return getRepository(UserModel).save(user);
    },

    login: async (
      _,
      { email, password }: User,
      { response, request }: { response: Response; request: Request }
    ) => {
      console.log(request.session);
      const user = await getRepository(UserModel).findOne({
        where: { email }
      });
      if (isNil(user)) {
        return new ApolloError(
          "not_found",
          { message: "User not found" },
          { message: "User not found" }
        );
      }
      if (!(await argon.verify(user.password, password))) {
        return new ApolloError(
          "not_found",
          { message: "Password is wrong" },
          { message: "Password is wrong" }
        );
      }
      response.cookie("qid", "muie");
      return user;
    }
  }
};
export default userResolver;
