import morgan from 'morgan';

const loggingMiddleware = (isProduction: boolean) =>
  isProduction ? morgan('combined') : morgan('dev');

export default loggingMiddleware;
