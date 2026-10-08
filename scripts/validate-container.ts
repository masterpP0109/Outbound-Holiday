import { assertDatabaseConfiguration } from '../server/config';
assertDatabaseConfiguration();
if(process.env.MIGRATE_ON_START&&!['true','false'].includes(process.env.MIGRATE_ON_START))throw new Error('MIGRATE_ON_START must be true or false.');
