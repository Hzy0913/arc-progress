import { dataType, isInt } from './utils';
import { fillType } from './arc-progress';

export const PI = Math.PI;

export const setSpeed = (dProgress, speedOption, animation): number => {
  let speed: number = 1;
  if (animation && typeof animation === 'number') {
    speed = dProgress / (animation / (1000 / 60));
  } else if (typeof speedOption === 'number') {
    speed = 1; // reset speed
    if (speedOption > 0) {
      speed += speedOption / 40;
    } else {
      speed += speedOption / 101;
    }
  }

  return speed;
};

export const setIncreaseValue = (dProgress, prevText = '0', speed, text): number => {
  const frequency = dProgress / speed; // add this line

  const numberText = Number(text);
  const prevNumberText = Number(prevText);
  const dText = numberText > prevNumberText ? numberText - prevNumberText
    : prevNumberText - numberText;
  let increaseValue = dText / frequency;

  if (isInt(text) && (!(increaseValue % 2) || !(increaseValue % 5))) {
    increaseValue = increaseValue - 1 > 0 ? increaseValue -= 1 : 1;
  }
  return increaseValue;
};

export const sourceLoad = (fillColor, updateImg?: boolean): any => {
  return new Promise((resolve, reject) => {
    if (dataType(fillColor) === 'object' && updateImg) {
      const { image } = fillColor as fillType;
      const imgInstance = new Image();
      imgInstance.src = image;
      imgInstance.onload = () => {
        resolve({ img: imgInstance, src: image });
      };
      imgInstance.onerror = (err) => {
        reject(err);
      };
    } else {
      resolve(false);
    }
  });
};

export const computedArc = (arcStart, arcEnd, percentage): {start: number, end: number} => {
  const conversionRate = 180; //  360/2

  const start = arcStart / conversionRate;
  const end = arcEnd / conversionRate;

  const degreeCount = end - start;
  const progress = degreeCount * (percentage / 100) + start;
  const endPI = progress * PI;
  const startPI = start * PI;

  return { start: startPI, end: endPI };
};

export const requestAnimationFrame = (cb) => {
  return window.requestAnimationFrame(cb);
};

export const getDProgress = (prevProgress: number = 0, progress) => progress > prevProgress ?
  progress - prevProgress : prevProgress - progress;

export const computedPercentage = (progress, type, currentPercentage, speed): number => {
  let percentage = currentPercentage;
  if (type === 'increase') {
    percentage += speed;
    if (percentage > progress) {
      percentage = progress;
    }
  } else {
    percentage -= speed;
    if (percentage < progress) {
      percentage = progress;
    }
  }
  return percentage;
};

type computedTextType = (text: string, isEnd: boolean, type: string, increaseValue: number,
  cacheTextValue: number, setCacheState: Function) => string;

export const computedText = (): computedTextType  => {
  let lastNumber: number = 0;

  return function (text, isEnd, type, increaseValue, cacheTextValue, setCacheState) {
    let computedText = cacheTextValue;
    const isIntValue = isInt(text);
    if (type === 'increase') {
      computedText += increaseValue;
    } else {
      computedText -= increaseValue;
    }
    setCacheState({ textValue: computedText });
    if (isEnd) return text;

    if (!isIntValue) {
      const decimal = text.split('.')[1].length;

      lastNumber = lastNumber === 9 ? 0 : lastNumber + 1;
      if (decimal > 1) {
        return computedText.toFixed(decimal - 1) + lastNumber;
      }
      return `${computedText.toFixed(0)}.${lastNumber}`;
    }

    return String(Math.floor(computedText));
  };
};
