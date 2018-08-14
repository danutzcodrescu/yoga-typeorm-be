/* tslint:disable */

export interface Query {
  users?: (User | null)[] | null;
  user?: User | null;
}

export interface User {
  id?: string | null;
  username?: string | null;
  email?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  friends?: (User | null)[] | null;
}

export interface Mutation {
  register?: User | null;
  login?: User | null;
  logout?: string | null;
  addFriend?: User | null;
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
export interface AddFriendMutationArgs {
  id: string;
}
