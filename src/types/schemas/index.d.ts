/* tslint:disable */

export interface Query {
  users?: (User | null)[] | null;
  user?: User | null;
}

export interface User {
  id?: string | null;
  username?: string | null;
  email?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Mutation {
  register?: User | null;
  login?: User | null;
  logout?: string | null;
}
export interface UserQueryArgs {
  email?: string | null;
  username?: string | null;
}
export interface RegisterMutationArgs {
  email: string;
  username: string;
  password: string;
}
export interface LoginMutationArgs {
  email: string;
  password: string;
}
export interface LogoutMutationArgs {
  email: string;
}
