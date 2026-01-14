const logger = (req, res, next) => {
  const start = Date.now();
  const { method, path } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    console.log(`${method} ${path} ${statusCode} - ${duration}ms`);
  });

  next();
};

module.exports = logger;
