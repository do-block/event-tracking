import { App } from 'vue';
import EventTracking from './tracking/index';
import { TrackingSymbol } from './tracking/root';
import { EventCode } from './types/eventCode';
import { PageCode } from './types/pageCode';
import { RouteLocationNormalized, Router } from 'vue-router';
import { routerConfig } from './types/routerConfig';
import { logPrefix } from './types/track';

export { useEventTracking, updateBaseConfig } from './tracking/index';

export * from './types/track';
export * from './types/index';
export * from './types/eventCode';
export * from './types/pageCode';
export * from './types/routerConfig';

export function createTracking<E>(
  config: ConstructorParameters<typeof EventTracking>[0],
  routerConfig?: routerConfig<E>
) {
  return {
    install(app: App) {
      const trackingFn = new EventTracking(config);

      app.provide(TrackingSymbol, trackingFn);
      app.config.globalProperties.$tracking = trackingFn;

      /**
       * 路由监测
       * 1. 页面级别
       */
      if (routerConfig?.enable) {
        const router = app.config.globalProperties.$router as Router;

        if (router) {
          const getBaseConfig = (
            eventCode: EventCode | E,
            pageCode: PageCode
          ) => ({
            ...config.baseOption,
            ENTER_TIME: Date.now(),
            EVENT_CODE: eventCode,
            PAGE_CODE: pageCode,
            PAGE_URL:
              (window && encodeURIComponent(window.location.href)) || '',
            EVENT: eventCode === EventCode.LOAD ? '加载' : '离开',
          });

          const send = async (
            route: RouteLocationNormalized,
            eventCode: EventCode
          ) => {
            await trackingFn.Log({
              options: routerConfig?.useConfig
                ? {
                    ...routerConfig?.useConfig,
                    ...getBaseConfig(
                      eventCode,
                      route?.meta?.pageCode as PageCode
                    ),
                  }
                : getBaseConfig(eventCode, route?.meta?.pageCode as PageCode),
            });
          };

          const hasPageCode = (route: RouteLocationNormalized) => {
            if (!route?.meta?.pageCode) {
              console.warn(
                logPrefix +
                  '当前可能为路由TRACKING全局模式，需要在路由下添加meta属性 [pageCode], 或者添加includes属性'
              );
              return false;
            }
            return true;
          };

          const isExclude = (route: RouteLocationNormalized) => {
            if (routerConfig?.includes) {
              return routerConfig.includes?.includes(route.path);
            }
            return true;
          };

          router.beforeEach(async (to, _, next) => {
            try {
              if (!isExclude(to)) {
                next();
                return;
              }

              if (hasPageCode(to)) {
                await send(to, EventCode.LOAD);
              }
              next();
            } catch (err) {
              next();
            }
          });

          router.afterEach(async (_, from) => {
            try {
              if (!isExclude(from)) {
                return;
              }

              if (hasPageCode(from)) {
                await send(from, EventCode.LEAVE);
              }
            } catch (err) {}
          });
        } else {
          console.warn(
            logPrefix +
              '当前可能为路由TRACKING全局模式，需要在路由下添加meta属性 [pageCode], 或者添加includes属性'
          );
        }
      }
    },
  };
}
