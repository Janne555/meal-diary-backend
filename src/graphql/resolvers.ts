import { Resolvers, RoleResolvers, UserResolvers } from "../types/generated"
import { Context } from "../types"

const resolvers: Pick<Resolvers<Context>, 'Mutation' | 'Query'> = {
  Query: {
    users: (parent, args, context, info) => {
      return context.userDataSource.getUsers()
    },
    foods: async (parent, { params }, { foodDataSource }) => {
      return foodDataSource.getFoods(params ?? {})
    },
    config: (parent, args, { configDataSource }) => {
      return configDataSource.getConfig()
    },
    food: (parent, { id }, { foodDataSource }) => {
      return foodDataSource.getFood(id)
    }
  },
  Mutation: {
    assignRoleToUser: async (parent, { roleIds, userId }, context) => {
      await context.userDataSource.assignRolestoUser({ id: userId }, { roles: roleIds })
      return context.userDataSource.getUser({ id: userId })
    },
    updateConfig: async (parent, params, context) => {
      try {
        const config = await context.configDataSource.updateConfig(params.config)
        return {
          code: "200",
          success: true,
          message: "Config updated succesfully",
          config
        }
      } catch (error) {
        const config = await context.configDataSource.getConfig()
        return {
          code: "500",
          success: false,
          message: `Failed to update config: ${error.message}`,
          config
        }
      }
    },
    addFood: async (parent, { food }, { foodDataSource }) => {
      const storedFood = await foodDataSource.addFood(food)
      return {
        code: "",
        message: "",
        success: true,
        food: storedFood
      }
    }
  }
}

const Role: Partial<RoleResolvers<Context>> = {
  permissions: async (r, params, context) => r.id ? (await context.userDataSource.getPermissionsInRole({ id: r.id })) : null
}

const User: Partial<UserResolvers<Context>> = {
  roles: async (u, params, context) => u.userId ? (await context.userDataSource.getUserRoles({ id: u.userId })) : null,
  permissions: async (u, params, context) => u.userId ? (await context.userDataSource.getUserPermissions({ id: u.userId })) : null
}

export default {
  ...resolvers,
  Role,
  User
}