declare module 'merge-graphql-schemas' {
  export function fileLoader(path: any): any;
  export function mergeResolvers(resolvers: any[], options?: any): any;
  export function mergeTypes(types: any[], options?: any): any;
}
