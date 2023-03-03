import { createLogger, transports, format } from "winston";

const logFormat = format.printf(({ level, message, timestamp, stack }) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${timestamp} . ${level}: ${stack || message}`;
});

const levels = {
  levels: {
    crit: 0,
    error: 1,
    warn: 2,
    success: 3,
    info: 4,
    debug: 5,
    silly: 6,
  },
  colors: {
    crit: "bold black redBG",
    error: "red",
    warn: "yellow",
    success: "green",
    info: "cyan",
    debug: "magenta",
    silly: "white",
  },
};

const logger = createLogger({
  format: format.combine(
    format.colorize({ colors: levels.colors }),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.align(),
    logFormat
  ),
  levels: levels.levels,
  transports: [
    new transports.Console(),
    new transports.File({ filename: "error.log", level: "warn" }),
  ],
});

export default {
  silly: logger.silly.bind(logger),
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  crit: logger.crit.bind(logger),

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - type exists but it doesn't see it in the code.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  success: logger.success.bind(logger),
};
