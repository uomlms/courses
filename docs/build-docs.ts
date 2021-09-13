import m2s from 'mongoose-to-swagger';
import fs from 'fs';
import path from 'path';



const buildSchemas = async () => {
  const schemas: any = {};
  const files = fs.readdirSync('./src/models');
  for (const file of files) {
    // module: { SchemaName: Model { SchemaName } }
    const module = await import(`../src/models/${file}`);
    // schema:  Model { SchemaName }
    const modelName = Object.keys(module)[0];
    const schema = module[modelName];
    const swaggerSchema = m2s(schema, { omitFields: ['_id'] });
    schemas[modelName] = swaggerSchema;
  }

  return schemas;
}

const readDocs = () => {
  return JSON.parse(fs.readFileSync('./docs/docs.json', 'utf-8'));
}

const buildDocs = async () => {
  const docs = readDocs();
  const schemas = await buildSchemas();

  docs.components.schemas = schemas;
  fs.writeFileSync(`./docs/docs.json`, Buffer.from(JSON.stringify(docs, null, '\t')));
}

buildDocs();
