import express from 'express';
import { spawn } from 'child_process';
const router = express.Router();
router.get('/', async(req, res) => {
    let header = req.headers['api-key'];
    if (header !== process.env.API_KEY) {
        return res.status(403).send('Unauthorized access, invalid API key provided');
    }
    res.setHeader('Content-Type', 'text/plain');
    const streamOutput = (message) => {
        console.log(message);
        res.write(`${message}\n`);
    };
    try{
        streamOutput('Viewing all memory and disk usage...');
        const options = {  shell: true }; // Set working directory
    
        streamOutput('Running memory utilization commands...');
        await runCommand('free', ['-h'], options, streamOutput);
        streamOutput('Running disk space utilization commands...');
        await runCommand('df', ['-f'], options, streamOutput);
        streamOutput('Operation successfull.');
        res.end();
    }
    catch(err){
        streamOutput(`Error: ${err.message}`);
        console.error(`Error during execution: ${err.message}`);
    streamOutput(`Error during execution: ${err.message}`);
    res.status(500).end(); // End the response in case of an error
    }
    

});
export default router;


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