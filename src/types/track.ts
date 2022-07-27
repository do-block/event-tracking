import { PageCode } from './pageCode';
import { EventCode } from './eventCode';
import { baseUrlKey, extraUrlKey } from '../privateKey';

export type seedType =
  | 'click'
  | 'download'
  | 'share'
  | 'leave'
  | 'load'
  | 'view';

export const logPrefix = 'agLog: ';

export const dataBaseKey = 'seed';
export const dataKey = 'data-' + dataBaseKey;
export const extraBaseKey = 'aext';
export const dataExtra = 'data-' + extraBaseKey;

export type callback = ((iArguments: IArguments) => void) | undefined;

export const eventMap: Record<seedType, boolean> = {
  click: true,
  download: true,
  share: true,
  leave: true,
  load: true,
  view: true,
};

export type baseOptionType = Partial<
  Record<keyof typeof baseUrlKey, string | number | boolean>
> & {
  ENVIRONMENT: 'test' | 'pre' | 'production';
};

export type extraOptionsType = Partial<
  Omit<
    Record<keyof typeof extraUrlKey, string | number | boolean>,
    'PAGE_CODE' | 'EVENT_CODE'
  >
> & {
  PAGE_CODE: PageCode;
  EVENT_CODE: EventCode;
};

export type optionsType = baseOptionType & extraOptionsType;

export type sendSeed = <E>(
  seed?: Omit<optionsType, 'EVENT_CODE'> & {
    EVENT_CODE: EventCode | E;
  }
) => Promise<boolean> | boolean | void;
