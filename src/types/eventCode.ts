export enum EventCode {
  //  0	加载
  LOAD = 0,
  //   -1	离开
  LEAVE = -1,
}

export type EventCodeType = keyof typeof EventCode;
