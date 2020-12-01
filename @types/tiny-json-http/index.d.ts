declare type Options = {
  url: string
  data?: any // form vars for tiny.post, tiny.put, tiny.patch, and tiny.delete otherwise querystring vars for tiny.get
  headers?: any //  key/value map used for headers (including support for uploading files with multipart/form-data)
  buffer?: boolean //  if set to true the response body is returned as a buffer
  timeout?: number
}

declare type Result = {body: any, headers: any};
declare type Callback = (err?: Error, res: Result) => void

export declare function post(options: Options): Promise<Result>
export declare function post(options: Options, callback: Callback): void

export declare function get(options: Options): Promise<Result>
export declare function get(options: Options, callback: Callback): void
