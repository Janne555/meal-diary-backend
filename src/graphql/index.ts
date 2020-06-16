import { ApolloServer } from "apollo-server-express";
import { DIRECTIVES } from "@graphql-codegen/typescript-mongodb";
import { Context, UserToken } from "../types";
import { AuthDirective } from "./directives";
import resolvers from "./resolvers";
import typeDefs from './schema';
import { isToken } from "../utils/typeguards";
import { UserDataSource, FoodDataSource } from "../datasources";
import ConfigDataSource from "../datasources/configDataSource";

const graphqlServer = new ApolloServer({
  typeDefs: [DIRECTIVES].concat(typeDefs) as any, resolvers: { ...resolvers }, context: ({ req }) => {
    const userToken = ((): UserToken => {
      if (isToken((req as any).user)) {
        const user: UserToken = (req as any).user
        user.hasRoles = function (roles: string[]): boolean {
          return roles.every(role => this.permissions.includes(role))
        }
        return user
      } else {
        throw Error("failed to find user in context")
      }
    })()

    const context: Context = {
      userDataSource: new UserDataSource(),
      foodDataSource: new FoodDataSource({ userId: userToken.sub, name: null, permissions: [], roles: [] }),
      configDataSource: new ConfigDataSource(),
      userToken
    }
    return context
  },
  schemaDirectives: {
    auth: AuthDirective
  }
});

export default graphqlServer