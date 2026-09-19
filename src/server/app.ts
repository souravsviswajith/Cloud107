import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error';
import { requestContextMiddleware } from './middleware/context';

export const app = express();

// Set Request Context
app.use(requestContextMiddleware);

// Configure Morgan for logging with correlation ID
// eslint-disable-next-line @typescript-eslint/no-explicit-any
morgan.token('id', (req: any) => req.context?.correlationId || req.id);
app.use(morgan(':id :method :url :status :res[content-length] - :response-time ms'));

// Security & Parsing
app.use(helmet({
  contentSecurityPolicy: false, // Often disabled in dev for Vite
}));
app.use(cors());
app.use(compression());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Error Handling
app.use(errorHandler);
