const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const app = express();
const port = 3001; // Port for the API Gateway

// Parse JSON bodies for this app. Make sure you place body-parser before your CRUD handlers!
app.use(express.json());

const protoPath = './rental_service.proto';
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition);
console.log(JSON.stringify(grpcObject, null, 2));


const RentalService = grpcObject.RentalService;

if (!RentalService) {
    console.error("RentalService is not found in the gRPC object.");
    process.exit(1); // Stop the process if we don't find the service
  }

  const grpcClient = new RentalService(
  'localhost:8001',
  grpc.credentials.createInsecure()
);

app.post('/rental', (req, res) => {
  grpcClient.CreateRental(req.body, (error, response) => {
    if (error) {
      console.error('Error creating rental:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.json(response);
  });
});

const avtoServiceProxy = createProxyMiddleware({
  target: 'http://avto-service1:8080', 
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req) => {
    if (req.method !== 'GET' && req.method !== 'POST') {
      proxyReq.destroy();
    }
  }
});

const userServiceProxy = createProxyMiddleware({
  target: 'http://avto-service3:8080', 
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req) => {
    if (req.method !== 'GET' && req.method !== 'POST') {
      proxyReq.destroy();
    }
  }
});

  
app.use('/avto', avtoServiceProxy);
app.use('/users', userServiceProxy);

// Start the gateway
app.listen(port, () => {
  console.log(`API Gateway listening at http://localhost:${port}`);
});
