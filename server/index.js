import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { createCrudRouter } from './createCrudRouter.js';
import { specs } from './swagger.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
// Note: We mount them at /api/[resource]
app.use('/api/tenants', createCrudRouter('tenants'));
app.use('/api/properties', createCrudRouter('properties'));
app.use('/api/issues', createCrudRouter('issues'));
app.use('/api/documents', createCrudRouter('documents'));
app.use('/api/costs', createCrudRouter('costs'));
app.use('/api/contacts', createCrudRouter('contacts'));

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Domus API is running' });
});

// API Root
app.get('/api', (req, res) => {
    res.json({
        message: 'Domus API v1',
        resources: [
            '/api/tenants',
            '/api/properties',
            '/api/issues',
            '/api/documents',
            '/api/costs',
            '/api/contacts'
        ],
        documentation: '/api-docs'
    });
});

// Start server if main module
if (process.argv[1] === new URL(import.meta.url).pathname) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Documentation available at http://localhost:${PORT}/api-docs`);
    });
}

export default app;
