// Type declarations for packages without bundled types



declare module 'mammoth' {
  interface Result {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  interface Options {
    buffer?: Buffer;
    path?: string;
    arrayBuffer?: ArrayBuffer;
  }
  function extractRawText(input: Options): Promise<Result>;
  function convertToHtml(input: Options): Promise<Result>;
  export { extractRawText, convertToHtml };
}
