import express from 'express';
import { spawn } from 'child_process';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World from devsomeware cicd');
});

router.post('/', async (req, res) => {
  let header = req.headers['api-key'];
  if(header==undefined){
    return res.status(403).send('Unauthorized access, invalid API key provided');
  }
  let foldername = req.body.foldername;
  let servicename = req.body.servicename;
  console.log(foldername);
  console.log(servicename);

  console.log(header);
  if (header != process.env.API_KEY) {
    return res.status(403).send('Unauthorized access, invalid API key provided');
  }

  res.setHeader('Content-Type', 'text/plain');

  const streamOutput = (message) => {
    console.log(message); // Logs the output on the server console
    res.write(`${message}\n`); // Streams output to the user
  };

  try {
    streamOutput('Starting the app set all conf..');

    const options = { cwd: foldername, shell: true }; // Set the working directory for the commands
    streamOutput('Listing all contents...');
    await runCommand('ls', [], options, streamOutput);
    streamOutput('Starting PM2 app...');
    await runCommand(
      'pm2',
      ['start', '"npm run start"', '--name', servicename],
      options,
      streamOutput
    );

    streamOutput('Listing all PM2 services...');
    await runCommand('pm2', ['list'], options, streamOutput);

    streamOutput('All commands executed successfully.');
    streamOutput('App started successfully.');
    streamOutput('Services are up and running.');

    res.end(); // End the response after all commands are processed
  } catch (error) {
    console.error(`Error during execution: ${error.message}`);
    streamOutput(`Error during execution: ${error.message}`);
    res.status(500).end(); // End the response in case of an error
  }
});

export default router;

// Helper function to run commands
function runCommand(command, args, options, onDataCallback) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, options);

    process.stdout.on('data', (data) => {
      const output = data.toString();
      onDataCallback(output); // Stream output to the user
    });

    process.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      onDataCallback(`Error: ${errorOutput}`); // Stream error to the user
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" failed with code ${code}`));
      }
    });
  });
}
