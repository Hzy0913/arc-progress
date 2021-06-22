import React, { useEffect, useRef } from 'react';
import {
  setSpeed,
  setIncreaseValue,
  sourceLoad,
  computedArc,
  requestAnimationFrame,
  getDProgress,
  computedPercentage,
  computedText,
  PI,
} from './computed';
import { dataType, useCacheState } from './utils';

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

function arcProgress(props: Options) {
  const canvasRef = useRef(null);
  const [cacheState, setCacheState] = useCacheState();

  const maxProgressValue = 1;
  //[undefined,1,0,-1,2,3,NaN,null,''].map(x=>fixProgress(x))
  const fixProgress = (p: any): number => {
    p = parseFloat(p + '');
    if (!isFinite(p) || p < 0) {
      p = 0;
    }
    else if (p > maxProgressValue) {
      p = maxProgressValue;
    }
    return p;
  }


  let ctx: CanvasRenderingContext2D;
  let type: string = 'increase';
  let speed: number;
  let increaseValue: number;

  const { size = 200, arcStart = 144, arcEnd = 396, text, animationEnd, emptyColor = '#efefef',
    fillColor = '#6bd5c8', lineCap = 'round', animation, textStyle: setTextStyle = {},
    customText = [], observer, onError, speed: speedOption, style = {}, className = '',
    children = null,
  } = props || {};
  const hdSize = size * 2; // HD mode
  const optionProgress = fixProgress(props.progress);
  const progress = optionProgress * 100;
  const thickness = (props.thickness || 12) * 2;
  const fillThickness = props.fillThickness * 2 || thickness;
  const textStyle = { size: '18px', color: '#000', x: size / 2, y: size / 2, ...setTextStyle };

  const computedCurrentText = computedText();

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

  const drawText = (): void => {
    const { isEnd, textValue } = cacheState;
    const countText = text && computedCurrentText(text, isEnd, type, increaseValue,
      textValue, setCacheState);
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
    setCacheState({ isEnd, percentage: computedPercentage(progress, type, percentage, speed) });

    ctx.clearRect(0, 0, hdSize, hdSize);
    drawBackground();
    drawText();
    if (progress > 0)
      drawProgress();

    if (isEnd) return;

    requestAnimationFrame(drawProgressAnimate);
  };
  const init = (updateImg): void => {
    const { prevProgress, prevText } = cacheState;
    const dProgress = getDProgress(prevProgress, progress);
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

  const setFillColor = (): void => {
    const fillColorType = dataType(fillColor);
    if (fillColorType === 'string') {
      ctx.strokeStyle = fillColor as string;
    } else if (fillColorType === 'object' && (fillColor as fillType).image) {
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

  useEffect(() => {
    ctx = canvasRef.current.getContext('2d');
    const isUpdateImg = dataType(fillColor) === 'object' && !!(fillColor as fillType).image;
    init(isUpdateImg);

    setCacheState({ prevProgress: progress, prevText: text });
  }, []);

  useEffect(() => {
    const { isEnd, prevProgress, fillImage } = cacheState;
    if (!isEnd || prevProgress === progress) return; // if animation is running, don't render

    ctx = canvasRef.current.getContext('2d');
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
