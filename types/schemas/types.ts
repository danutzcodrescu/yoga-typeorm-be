/* tslint:disable */

export interface Query {
  users?: User | null;
}

export interface User {
  id?: string | null;
  username?: string | null;
  email?: string | null;
  password?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
