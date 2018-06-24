import * as path from 'path';
import { fileLoader, mergeTypes } from 'merge-graphql-schemas';

const schemas = fileLoader(path.join(__dirname, '*.graphql'));

export default mergeTypes(schemas);
