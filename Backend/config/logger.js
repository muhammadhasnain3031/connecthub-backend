import winston from 'winston';

// 1. Log ke levels aur unke colors define karein
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// 2. Log ka format set karein (Timestamp + Level + Message)
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
  )
);

// 3. Transports configure karein (Console aur Files dono ke liye)
const transports = [
  // Console par dekhne ke liye (With Colors)
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize({ all: true }))
  }),
  // Saare errors ko is file mein save karne ke liye
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Saare logs (error, info, warn) ko is file mein save karne ke liye
  new winston.transports.File({ 
    filename: 'logs/combined.log' 
  }),
];

// 4. Logger instance banayein
const logger = winston.createLogger({
  level: 'debug', // Is level tak ke saare logs capture honge
  levels,
  format,
  transports,
});

export default logger;
