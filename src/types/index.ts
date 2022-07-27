import { PageCode } from './pageCode';
import { EventCode, EventCodeType } from './eventCode';

export const trackEvent: Partial<
  Record<PageCode, Record<EventCodeType, EventCode>>
> = {
  [PageCode.HOME]: {
    LOAD: EventCode.LOAD,
    LEAVE: EventCode.LEAVE,
  },
};
