import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';


const app = express();
const port = 5000;
app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(express.json());

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
    console.log(`http://localhost:${port}`)
})


app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);