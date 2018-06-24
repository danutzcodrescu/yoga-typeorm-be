import * as path from 'path';
import { mergeResolvers, fileLoader } from 'merge-graphql-schemas';

const resolvers = fileLoader(path.join(__dirname, '*.resolver.ts'));
export default mergeResolvers(resolvers, { all: true });
