import {
  logPrefix,
  optionsType,
  sendSeed,
  baseOptionType,
  extraOptionsType,
  extraBaseKey,
  dataBaseKey,
} from '../types/track';
import { baseUrlKey, extraUrlKey, requestKey } from '../privateKey';

const allUrlKey = { ...baseUrlKey, ...extraUrlKey, ...requestKey };

export const serializeSeedToUrl = <E>(seed?: optionsType | E) => {
  let extraUrl = '';

  if (seed) {
    const logKeysArr = (Object.keys(seed) as (keyof typeof allUrlKey)[]).map(
      (key) => {
        return `${allUrlKey[key]}=${seed[key as keyof (extraOptionsType | E)]}`;
      }
    );
    extraUrl = logKeysArr.join('&');
  }

  return extraUrl;
};

export const getSeed = ({
  sendSeedFn,
  options,
}: {
  sendSeedFn: sendSeed;
  options: baseOptionType;
}) => {
  window.addEventListener(
    'click',
    async (e) => {
      await collectDom(e);
    },
    true
  );

  async function collectDom(e: Event) {
    let { target } = e;
    if (!target) {
      return;
    }

    let dataSet = (target as HTMLElement).dataset;

    let seed = dataSet[dataBaseKey];

    if (!seed) {
      const path = (e as any).path || e?.composedPath();
      if (
        !(path as HTMLElement[]).some((item) => {
          const itemDataSet = item.dataset;

          if (itemDataSet?.[dataBaseKey]) {
            seed = itemDataSet[dataBaseKey];
            dataSet = itemDataSet;
            target = item;
            return true;
          }

          return false;
        })
      ) {
        return;
      }
    }

    const seedExtra: Record<string, any> = {};

    const invalidKeys: string[] = [];

    // Check whether there are illegal keys and handle additional keys
    Object.keys(dataSet)?.forEach((key) => {
      try {
        const len = key.split(extraBaseKey).length;
        const newKey = key.replace(extraBaseKey, '').toUpperCase();

        if (key !== dataBaseKey) {
          if (newKey in allUrlKey) {
            const value = dataSet[key];
            if (value) {
              seedExtra[newKey] = value;
            } else {
              console.warn(`${logPrefix + newKey} is empty`);
            }
          } else if (len > 1) {
            invalidKeys.push(newKey);
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    if (invalidKeys.length > 0) {
      console.warn(`${logPrefix}Invalid keys: ${invalidKeys.join(',')}`);
    }

    const newOptions = options ? { ...options, ...seedExtra } : seedExtra;

    const extraKeys = (
      Object.keys(newOptions)?.filter(
        (key) => key in allUrlKey
      ) as (keyof typeof allUrlKey)[]
    )?.map((key) => allUrlKey[key]);

    if (
      !(
        extraKeys?.length &&
        Object.values(requestKey).every((key) => {
          return extraKeys.includes(key);
        })
      )
    ) {
      console.error(
        'Request key is not complete, please read the docs',
        target
      );
      return;
    }

    try {
      await sendSeedFn({
        ...newOptions,
        ENTER_TIME: Date.now(),
      } as optionsType);
    } catch (err) {
      console.error(err);
    }
  }
};
