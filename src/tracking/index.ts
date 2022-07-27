import {
  baseOptionType,
  callback,
  extraOptionsType,
  optionsType,
  sendSeed,
} from '../types/track';
import { getSeed, serializeSeedToUrl } from '../utils';
import { getCurrentInstance, inject, onMounted, onUnmounted } from 'vue';
import { TrackingSymbol } from './root';
import { EventCode } from '../types/eventCode';
import { PageCode } from '../types/pageCode';

export default class EventTracking {
  private baseOptions: baseOptionType;
  private readonly imgSrc: string = '';

  private callback: callback;
  private readonly sendSeedFn: sendSeed;

  constructor({
    baseOption,
    sendSeed,
    callback,
    imgSrc,
    collect,
  }: {
    // Fixed parameters
    baseOption: baseOptionType;
    // Custom send function
    sendSeed?: sendSeed;
    // Customized callback function
    callback?: () => void;
    // Picture address
    imgSrc: string;
    // Turn on DOM collection
    collect?: boolean;
  }) {
    this.baseOptions = baseOption;
    this.callback = callback;

    this.imgSrc = imgSrc;
    this.sendSeedFn = sendSeed || this.defaultSendSeed();

    collect && this.init();
  }

  private defaultSendSeed() {
    return <E>(
      seed?: Omit<optionsType, 'EVENT_CODE'> & {
        EVENT_CODE: EventCode | E;
      }
    ): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        const img = new Image(1, 1);

        img.src = this.imgSrc + '?' + serializeSeedToUrl(seed);

        img.onload = () => {
          resolve(true);
        };

        img.onerror = (err) => {
          reject(err);
        };

        img.onabort = () => {};

        // timeout handler
        setTimeout(() => {
          if (!img.complete || !img.naturalHeight) {
            reject(new Error('timeout'));
          }
        }, 2000);
      });
    };
  }

  // TODO: Currently, it supports automatic collection of click and focus events
  private collect() {
    getSeed({
      sendSeedFn: this.sendSeedFn,
      options: this.baseOptions,
    });
  }

  init() {
    this.collect();
  }

  setBaseConfig(config: baseOptionType) {
    this.baseOptions = { ...this.baseOptions, ...config };
  }

  async Log<E>({
    options,
  }: {
    options: Omit<extraOptionsType, 'EVENT_CODE'> & {
      EVENT_CODE: EventCode | E;
    };
  }) {
    await this.sendSeedFn<E>({ ...this.baseOptions, ...options });
  }
}

export const useEventTracking = <E>({
  useConfig,
  lifeCycle,
}: {
  lifeCycle?: {
    enable: boolean;
    PageCode: PageCode;
    EventCode?: {
      Leave: E;
      Load: E;
    };
  };
  useConfig?: Partial<
    Omit<extraOptionsType, 'EVENT_CODE'> & {
      EVENT_CODE: EventCode | E;
    }
  >;
}) => {
  const currentInstance = getCurrentInstance();

  const agTracking = currentInstance && inject(TrackingSymbol);

  if (lifeCycle?.enable && onMounted && onUnmounted) {
    const { PageCode } = lifeCycle;

    const getConfig = (eventCode: E | EventCode, event: '离开' | '加载') => {
      const base = {
        PAGE_CODE: PageCode,
        EVENT_CODE: eventCode,
        ENTER_TIME: Date.now(),
        EVENT: event,
      };
      return useConfig
        ? {
            ...useConfig,
            ...base,
          }
        : base;
    };

    onMounted(async () => {
      await agTracking?.Log({
        options: getConfig(EventCode.LOAD, '加载'),
      });
    });

    onUnmounted(async () => {
      await agTracking?.Log({
        options: getConfig(EventCode.LEAVE, '离开'),
      });
    });
  }

  async function useTracking(
    config: Omit<extraOptionsType, 'EVENT_CODE'> & {
      EVENT_CODE: EventCode | E;
    }
  ) {
    if (agTracking) {
      await agTracking?.Log({
        options: useConfig
          ? { ...useConfig, ...config, ENTER_TIME: Date.now() }
          : { ...config, ENTER_TIME: Date.now() },
      });
    }
  }
  return useTracking;
};

// Call when the baseConfig needs to be changed
export const updateBaseConfig = (config: baseOptionType) => {
  const currentInstance = getCurrentInstance();
  const agTracking = currentInstance && inject(TrackingSymbol);
  if (agTracking) {
    agTracking?.setBaseConfig(config);
  }
};
