import program from 'commander';
import * as constants from './common/constants';
import Server from './server/server';

program.version(constants.VERSION);

program.command('serve').action(async () => {
  const server = new Server();
  await server.start();
});

program.parse(process.argv);
