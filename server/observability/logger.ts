export interface LogContext {
  traceId?: string;
  correlationId?: string;
  tenantId?: string;
  taskId?: string;
  agentId?: string;
  [key: string]: any;
}

export class Logger {
  constructor(private defaultContext: LogContext = {}) {}

  public child(context: LogContext): Logger {
    return new Logger({ ...this.defaultContext, ...context });
  }

  public info(message: string, meta?: Record<string, any>): void {
    this.log('INFO', message, meta);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    this.log('WARN', message, meta);
  }

  public error(message: string, meta?: Record<string, any>): void {
    this.log('ERROR', message, meta);
  }

  public debug(message: string, meta?: Record<string, any>): void {
    this.log('DEBUG', message, meta);
  }

  private log(level: string, message: string, meta: Record<string, any> = {}): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.defaultContext,
      ...meta,
    };
    if (process.env.NODE_ENV !== 'test') {
      console.log(JSON.stringify(entry));
    }
  }
}

export const logger = new Logger();
