import React, { useEffect, useRef } from 'react';
import { isInt, dataType, useCacheState } from './utils';

export type lineCap = 'butt' | 'round' | 'square';

export type fillType = {image?: string, gradient?: string[]};

export type cacheType = {
  percentage?: number;
  textValue?: number;
  prevProgress?: number;
  prevText?: string;
  currentText?: string;
  fillImage?: {img: any, src: string};
  isEnd?: boolean;
};

export interface TextStyle {
  text?: string;
  size?: string;
  color?: string;
  x?: number;
  y?: number;
  font?: string;
  length?: number;
}

export interface Options {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  size?: number;
  arcStart?: number;
  arcEnd?: number;
  progress: number;
  text?: string;
  thickness?: number;
  fillThickness?: number;
  emptyColor?: string;
  fillColor?: string | fillType;
  lineCap?: lineCap;
  textStyle?: TextStyle;
  customText?: TextStyle[];
  speed?: number;
  animation?: boolean | number;
  animationEnd?: (any) => void;
  onError?: (any) => void;
  observer?: (current: {percentage: number, currentText: string}) => void;
}
const PI = Math.PI;

const setSpeed = (dProgress, speedOption, animation): number => {
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

const setIncreaseValue = (dProgress, prevText = '0', speed, text): number => {
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

const sourceLoad = (fillColor, updateImg?: boolean): any => {
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

const computedArc = (arcStart, arcEnd, percentage): {start: number, end: number} => {
  const conversionRate = 180; //  360/2

  const start = arcStart / conversionRate;
  const end = arcEnd / conversionRate;

  const degreeCount = end - start;
  const progress = degreeCount * (percentage / 100) + start;
  const endPI = progress * PI;
  const startPI = start * PI;

  return { start: startPI, end: endPI };
};

const requestAnimationFrame = (cb) => {
  return window.requestAnimationFrame(cb);
};

// let prevProgress: number;
// let prevText: string;
// let currentText: string;
// let fillImage: {img: any, src: string};

function arcProgress(props: Options) {
  const canvasRef = useRef(null);
  const [cacheState, setCacheState] = useCacheState();

  let ctx;
  let type: string = 'increase';
  let speed;
  let increaseValue;
  // let percentage: number = 0;
  // let cacheState: Function;

  const { size = 200, arcStart = 144, arcEnd = 396, text, animationEnd, emptyColor = '#efefef',
    fillColor = '#6bd5c8', lineCap = 'round', animation, textStyle: setTextStyle = {},
    customText = [], observer, onError, speed: speedOption, style = {}, className = '',
    children = null,
  } = props || {};
  const hdSize = size * 2; // HD mode
  const optionProgress = props.progress;
  const progress = props.progress * 100;
  const thickness = (props.thickness || 12) * 2;
  const fillThickness = props.fillThickness * 2 || thickness;
  const textStyle = { size: '18px', color: '#000', x: size / 2, y: size / 2, ...setTextStyle };

  const init = (updateImg): void => {
    const { prevProgress, prevText } = cacheState;
    const dProgress = getDProgress(prevProgress);
    speed = setSpeed(dProgress, speedOption, animation);

    if (text) {
      increaseValue = setIncreaseValue(dProgress, prevText, speed, text);
    }

    drawBackground(); // show background of progress bar when await image load

    sourceLoad(fillColor, updateImg).then((img) => {
      if (img) {
        setCacheState({ fillImage: img });
      }
      drawProgressAnimate();
    })
    .catch(err => onError && onError(err));
  };

  const getDProgress = (prevProgress: number = 0) => progress > prevProgress ?
    progress - prevProgress : prevProgress - progress;

  const computedPercentage = (type, currentPercentage, speed): number => {
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

  const computedText = ((): Function => {
    let lastNumber: number = 0;
    let { textValue } = cacheState;

    return function (text, isEnd, type, increaseValue) {
      const isIntValue = isInt(text);
      if (type === 'increase') {
        textValue += increaseValue;
      } else {
        textValue -= increaseValue;
      }
      setCacheState({ textValue });
      if (isEnd) return text;

      if (!isIntValue) {
        const decimal = text.split('.')[1].length;

        lastNumber = lastNumber === 9 ? 0 : lastNumber + 1;
        if (decimal > 1) {
          return textValue.toFixed(decimal - 1) + lastNumber;
        }
        return `${textValue.toFixed(0)}.${lastNumber}`;
      }

      return String(Math.floor(textValue));
    };
  })();

  const setText = (textSetting: TextStyle): void => {
    const { text, size = '14px', color = '#000', x = 10, y = 10, font = 'sans-seri' } = textSetting;

    const fontSize = parseInt(size, 10) * 2;
    const unit = size.substring(String(fontSize).length) || 'px';

    ctx.font = `${fontSize}${unit} ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x * 2, y * 2);
  };

  const drawBackground = (): void => {
    const halfSize = hdSize / 2;
    const conversionRate = 180; //  360/2
    const start = arcStart / conversionRate * PI;
    const end = arcEnd / conversionRate * PI;
    const isEmptyProgressBig = thickness >= fillThickness;
    const radius = isEmptyProgressBig ? halfSize - thickness :
      halfSize - thickness - (fillThickness - thickness);

    ctx.beginPath();
    ctx.lineWidth = thickness;
    ctx.lineCap = lineCap;
    ctx.strokeStyle = emptyColor;
    ctx.arc(halfSize, halfSize, radius, start, end, false);
    ctx.stroke();
    ctx.closePath();
  };

  const drawText = (): void => {
    const countText = text && computedText(text, cacheState.isEnd, type, increaseValue);
    let textContent = [];

    if (countText) {
      setCacheState({ currentText: countText });
      textContent.push({ text: countText, ...textStyle });
    }
    textContent = [...textContent, ...customText];

    for (let i = 0; i < textContent.length; i++) {
      setText(textContent[i]);
    }
  };

  const setFillColor = (): void => {
    const fillColorType = dataType(fillColor);
    if (fillColorType === 'string') {
      ctx.strokeStyle = fillColor as string;
    } else if (fillColorType === 'object') {
      const pattern = ctx.createPattern(cacheState.fillImage.img, 'no-repeat');
      ctx.strokeStyle = pattern;
    } else {
      const { gradient: gradientColors } = fillColor as fillType;
      const grad = ctx.createLinearGradient(0, 0, hdSize, 0);
      const length = gradientColors.length;
      const part = 1 / length;
      let partCount = 0;
      for (let i = 0; i < length; i++) {
        grad.addColorStop(partCount, gradientColors[i]);
        partCount += part;
      }
      ctx.strokeStyle = grad;
    }
  };

  const drawProgress = (): void => {
    const { percentage, currentText, isEnd } = cacheState;
    const halfSize = hdSize / 2;
    const { start, end } = computedArc(arcStart, arcEnd, percentage);
    ctx.beginPath();
    ctx.lineWidth = fillThickness;
    ctx.lineCap = lineCap;

    setFillColor();
    const isEmptyProgressBig = thickness >= fillThickness;

    const radius = isEmptyProgressBig ? halfSize - fillThickness - (thickness - fillThickness)
      : halfSize - fillThickness;
    ctx.arc(halfSize, halfSize, radius, start, end, false);

    ctx.stroke();
    ctx.closePath();

    observer && observer({ percentage, currentText });

    if (isEnd && animationEnd) {
      animationEnd({ text, progress: optionProgress });
    }
  };

  const drawProgressAnimate = (): void => {
    let { percentage } = cacheState;
    if (animation === false) {
      percentage = progress;
    }
    const isEnd = percentage === progress;

    setCacheState({ isEnd, percentage: computedPercentage(type, percentage, speed) });

    ctx.clearRect(0, 0, hdSize, hdSize);
    drawBackground();
    drawText();
    drawProgress();

    if (isEnd) return;

    requestAnimationFrame(drawProgressAnimate);
  };

  useEffect(() => {
    ctx = canvasRef.current.getContext('2d');

    init(true);

    setCacheState({ prevProgress: progress, prevText: text });
  }, []);

  useEffect(() => {
    if (!cacheState.isEnd) return; // if animation is running, don't render

    ctx = canvasRef.current.getContext('2d');
    const { prevProgress, fillImage } = cacheState;
    type = progress >= prevProgress ? 'increase' : 'decrease';
    const updateSrc = dataType(fillColor) === 'object' && (fillColor as fillType).image;
    const isUpdateImg = !!(updateSrc && fillImage) && (fillImage.src !== updateSrc);

    init(isUpdateImg);

    setCacheState({ prevProgress: progress, prevText: text });
  }, [progress]);

  const originalSize = size;
  const containerStyle = { width: `${originalSize}px`, height: `${originalSize}px` };
  const canvasStyle = { ...containerStyle, display: 'block',  ...style };
  const canvasSize = { height: hdSize, width: hdSize };
  const setClassName = className ? { className } : {};
  return(
    <div
      style={containerStyle}
      {...setClassName}
    >
      <canvas
        ref={canvasRef}
        {...canvasSize}
        style={canvasStyle}
      />
      {children}
    </div>
  );
}

export default arcProgress;
