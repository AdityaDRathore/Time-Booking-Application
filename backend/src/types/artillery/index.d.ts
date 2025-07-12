declare module 'artillery' {
  export interface RequestParams {
    headers: { [key: string]: string };
    body: any;
  }

  export interface Response {
    statusCode: number;
    body: any;
  }
}
