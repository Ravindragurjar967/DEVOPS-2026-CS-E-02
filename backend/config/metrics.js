const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default system metrics (CPU, Memory, Event Loop, GC)
client.collectDefaultMetrics({
  register,
  prefix: 'eprescription_'
});

// Custom HTTP Metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status_code']
});

const activeRequests = new client.Gauge({
  name: 'http_active_requests',
  help: 'Number of active HTTP requests currently being handled'
});

const dbConnectionStatus = new client.Gauge({
  name: 'database_connection_status',
  help: 'Database connection status (1 = connected, 0 = disconnected)'
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeRequests);
register.registerMetric(dbConnectionStatus);

// Middleware to capture metrics on incoming requests
const metricsMiddleware = (req, res, next) => {
  // Avoid tracking the metrics endpoint itself
  if (req.path === '/metrics') {
    return next();
  }

  activeRequests.inc();
  const start = process.hrtime();

  res.on('finish', () => {
    activeRequests.dec();
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    
    // Normalize route to avoid high cardinality (replace IDs with :id)
    const normalizedRoute = req.baseUrl + (req.route ? req.route.path : req.path.replace(/[0-9a-fA-F]{24}/g, ':id'));
    const statusCode = res.statusCode.toString();

    httpRequestsTotal.inc({
      method: req.method,
      route: normalizedRoute || req.path,
      status_code: statusCode
    });

    httpRequestDurationMicroseconds.observe(
      {
        method: req.method,
        route: normalizedRoute || req.path,
        status_code: statusCode
      },
      durationInSeconds
    );
  });

  next();
};

module.exports = {
  register,
  metricsMiddleware,
  dbConnectionStatus
};
