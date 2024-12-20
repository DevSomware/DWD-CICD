import express from 'express';
import cors from 'cors';
import 'dotenv/config';
const app = express();
import { rateLimit } from 'express-rate-limit'
import devsomeware from './router/devsomeware.js';
app.use(express.json());
app.use(cors());
app.use('/devsomeware',devsomeware);
//rate limiting because it is production api
const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, 
	max: 5,
    message: "Hold on their, maybe get a life instead of spamming my api.",
	standardHeaders: true,
	legacyHeaders: true, 
    skipFailedRequests: true
});
app.use(limiter);

app.get('/',(req,res)=>{
    res.send('Hello World');
})
app.listen(process.env.PORT || 3000,()=>{
    console.log('Server is running on port ',process.env.PORT || 3000);
})