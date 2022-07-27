import { InjectionKey } from 'vue';
import EventTracking from './index';

export const TrackingSymbol = Symbol('Tracking') as InjectionKey<
  InstanceType<typeof EventTracking>
>;
