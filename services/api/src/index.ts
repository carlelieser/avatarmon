import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRouter from './routes/generate';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8082', 10);
const HOST = '0.0.0.0';

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json({ limit: '10mb' }));

app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

app.use('/api/generate', generateRouter);

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
    res.json({ message: 'Avatarmon API', version: '1.0.0' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[API] Error:', err);
    res.status(500).json({ error: 'Internal api error' });
});

app.listen(PORT, HOST, () => {
    console.log(`api running on http://${HOST}:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
