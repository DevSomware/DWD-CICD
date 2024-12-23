import express from 'express';
import { spawn } from 'child_process';
const router = express.Router();
router.get('/', async(req, res) => {
    let header = req.headers['api-key'];
    console.log(header);
    if (header != process.env.API_KEY) {
        return res.status(403).send('Unauthorized access, invalid API key provided');
    }
   
    if(header==undefined){
      return res.status(403).send('Unauthorized access, invalid API key provided');
    }
    res.setHeader('Content-Type', 'text/plain');
    const streamOutput = (message) => {
        console.log(message);
        res.write(`${message}\n`);
    };
    try{
        streamOutput('Viewing all logs...');
        const options = {  shell: true }; // Set working directory
    
        streamOutput('Running logs command...');
        await runCommand('pm2', ['logs'], options, streamOutput);
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
  
      // Set timeout to terminate process after 5 seconds
      const timeout = setTimeout(() => {
        process.kill(); // Kill the process if it exceeds 5 seconds
        reject(new Error(`Process timed out after 5 seconds`));
      }, 4000);
  
      // Handle data from stdout
      process.stdout.on('data', (data) => {
        const output = data.toString();
        onDataCallback(output); // Stream output to the user
      });
  
      // Handle data from stderr
      process.stderr.on('data', (data) => {
        const errorOutput = data.toString();
        onDataCallback(`Error: ${errorOutput}`); // Stream error to the user
      });
  
      // Handle process completion
      process.on('close', (code) => {
        clearTimeout(timeout); // Clear the timeout if the process finishes
        if (code === 0) {
          resolve(); // Resolve the promise if the process completes successfully
        } else {
          reject(new Error(`Command "${command} ${args.join(' ')}" failed with code ${code}`));
        }
      });
    });
  }
  