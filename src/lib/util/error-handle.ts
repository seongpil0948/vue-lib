import { MessageOptions } from "naive-ui";

interface CatchParam {
  err: unknown;
  opt?: MessageOptions;
  userId?: string;
  prefix?: string;
}

export function catchError(p: CatchParam) {
  let message = errToStr(p.err);
  if (p.prefix) {
    message = `${p.prefix} ${message}`;
  }
  return message;
}

export function catchExcelError(p: CatchParam) {
  let m = errToStr(p.err);
  if (m.includes("password-protected")) {
    m = "엑셀파일에 비밀번호가 있습니다. " + m;
  }
  catchError(p);
}

export const errToStr = (err: unknown) =>
  err instanceof Error ? err.message : JSON.stringify(err);
