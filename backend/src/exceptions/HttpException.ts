/**
 * Custom HTTP exception class for handling API errors
 * Extends the standard Error class with an HTTP status code
 */
export class HttpException extends Error {
  public status: number;
  public message: string;

  /**
   * Create a new HTTP exception
   * @param status HTTP status code
   * @param message Error message
   */
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
    this.name = 'HttpException';
  }
}
