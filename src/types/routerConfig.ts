import { _RouteRecordBase } from 'vue-router';
import { extraOptionsType } from './track';
import { EventCode } from './eventCode';

interface routerBaseConfig<E> {
  enable: boolean;
  useConfig: Partial<
    Omit<extraOptionsType, 'EVENT_CODE' | 'PAGE_CODE'> & {
      EVENT_CODE: EventCode | E;
    }
  >;
}

export interface includeRouterConfig<E> extends routerBaseConfig<E> {
  includes?: _RouteRecordBase['path'][];
}

export interface excludeRouterConfig<E> extends routerBaseConfig<E> {
  excludes?: _RouteRecordBase['path'][];
}

export type routerConfig<E> = includeRouterConfig<E> & excludeRouterConfig<E>;
