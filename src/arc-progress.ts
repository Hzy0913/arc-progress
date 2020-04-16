import { isInt, type } from './utils';

interface TextStyle {
  text?: string;
  size?: string;
  color?: string;
  x?: number;
  y?: number;
  font?: string;
  length?: number;
}

type lineCap = 'butt' | 'round' | 'square';
type fillType = {image?: string, gradient?: string[]};

interface Options {
  el: string | HTMLElement;
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
  observer?: (progress?: number, text?: string) => void;
}

const PI = Math.PI;

class ArcProgress {
  public size: number;
  public el: string | HTMLElement;
  public canvas: HTMLCanvasElement;
  public ctx: any;
  public arcStart: number;
  public arcEnd: number;
  public progress: number;
  public optionProgress: number;
  public text: string;
  public animation: boolean | number;
  public textStyle: TextStyle;
  public customText: TextStyle[];
  private percentage: number = 0;
  private speed: number = 1;
  private speedOption: number = 0;
  private type: string = 'increase';
  private isEnd: boolean = false;
  private thickness: number;
  private fillThickness?: number;
  private animationEnd: (e: any) => void;
  private onError: (e: any) => void;
  private observer: (progress?: number, text?: string) => void;
  private emptyColor: string = '#efefef';
  private fillColor: string | fillType = '#6bd5c8';
  private lineCap: lineCap = 'round';
  private currentText: string;
  private increaseValue: number = 0;
  private frequency: number = 0;
  private lastNumber: number = 0;
  private prevProgress: number = 0;
  private prevText: string = '0';
  private textValue: number = 0;
  private fillImage: any;

  constructor({ size, el, textStyle = {}, arcStart = 144, arcEnd = 396, progress, text, thickness,
    fillThickness = 0, emptyColor, fillColor, lineCap, animation, speed = 0, customText,
    animationEnd = () => {}, onError = () => {}, observer,
  }: Options) {
    this.size = (size || 200) * 2; // HD mode
    this.arcStart = arcStart;
    this.arcEnd = arcEnd;
    this.optionProgress = progress;
    this.progress = progress * 100;
    this.text = text;
    this.el = el;
    this.thickness = (thickness || 12) * 2;
    this.fillThickness = fillThickness * 2 || this.thickness;
    this.animationEnd = animationEnd;
    this.onError = onError;
    this.emptyColor = emptyColor;
    this.fillColor = fillColor || this.fillColor;
    this.lineCap = lineCap || this.lineCap;
    this.animation = animation;
    this.textStyle = { size: '18px', color: '#000', x: this.size / 4,
      y: this.size / 4, ...textStyle };
    this.customText = customText || [];
    this.observer = observer;
    this.speedOption = speed;
    const isUpdateImg = type(this.fillColor) === 'object' && !!(<fillType>this.fillColor).image;
    this.init({ updateImg: isUpdateImg });
  }

  get isEmptyProgressBig(): boolean {
    return this.thickness >= this.fillThickness;
  }

  private init(option?: {notCreate?: boolean, updateImg?:boolean}): void {
    const { notCreate, updateImg } = option || {};
    this.createCanvas(notCreate);
    this.setSpeed();
    this.text && this.setIncreaseValue();
    this.sourceLoad(updateImg).then(() => this.drawProgressAnimate())
      .catch(err => this.onError(err));
  }

  private createCanvas(notCreate?: boolean): void {
    const el = typeof this.el === 'string' ? <HTMLElement>document.querySelector(this.el)
      : <HTMLElement>this.el;

    if (!notCreate) {
      this.canvas = document.createElement('canvas');
    }

    const originalSize = this.size / 2;
    el.style.width = `${originalSize}px`;
    el.style.height = `${originalSize}px`;
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.canvas.style.width = `${originalSize}px`;
    this.canvas.style.height = `${originalSize}px`;
    this.canvas.style.width = 'block';

    if (!notCreate) {
      el.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }
  }

  private drawBackground(): void {
    const ctx = this.ctx;
    const halfSize = this.size / 2;
    const conversionRate = 180; //  360/2
    const start = this.arcStart / conversionRate * PI;
    const end = this.arcEnd / conversionRate * PI;

    ctx.beginPath();
    ctx.lineWidth = this.thickness;
    ctx.lineCap = this.lineCap;
    ctx.strokeStyle = this.emptyColor;

    const radius = this.isEmptyProgressBig ? halfSize - this.thickness
      : halfSize - this.thickness - (this.fillThickness - this.thickness);
    ctx.arc(halfSize, halfSize, radius, start, end, false);
    ctx.stroke();
    ctx.closePath();
  }

  private computedArc(): {start: number, end: number} {
    const conversionRate = 180; //  360/2

    const start = this.arcStart / conversionRate;
    const end = this.arcEnd / conversionRate;

    const degreeCount = end - start;
    const progress = degreeCount * (this.percentage / 100) + start;
    const endPI = progress * PI;

    const startPI = start * PI;

    return { start: startPI, end: endPI };
  }

  private setSpeed(): void {
    const speedOption = this.speedOption;
    const animation = this.animation;
    const progress = this.progress;
    const prevProgress = this.prevProgress;
    const dProgress = progress > prevProgress ? progress - prevProgress : prevProgress - progress;

    if (animation && typeof animation === 'number') {
      this.speed = dProgress / (animation / (1000 / 60));
    } else if (typeof speedOption === 'number') {
      this.speed = 1; // reset speed
      if (speedOption > 0) {
        this.speed += speedOption / 40;
      } else {
        this.speed += speedOption / 101;
      }
    }

    this.frequency = dProgress / this.speed;
  }

  private setIncreaseValue(): void {
    const numberText = Number(this.text);
    const prevNumberText = Number(this.prevText);
    const dText = numberText > prevNumberText ? numberText - prevNumberText
      : prevNumberText - numberText;
    let increaseValue = dText / this.frequency;

    if (isInt(this.text) && (!(increaseValue % 2) || !(increaseValue % 5))) {
      increaseValue = increaseValue - 1 > 0 ? increaseValue -= 1 : 1;
    }
    this.increaseValue = increaseValue;
  }

  private computedText(): string {
    const lastNumber = this.lastNumber;
    const isIntValue = isInt(this.text);

    if (this.type === 'increase') {
      this.textValue += this.increaseValue;
    } else {
      this.textValue -= this.increaseValue;
    }

    if (this.isEnd) {
      return this.text;
    }
    if (!isIntValue) {
      const decimal = this.text.split('.')[1].length;

      this.lastNumber = lastNumber === 9 ? 0 : lastNumber + 1;
      if (decimal > 1) {
        return this.textValue.toFixed(decimal - 1) + this.lastNumber;
      }
      return `${this.textValue.toFixed(0)}.${this.lastNumber}`;
    }
    return String(Math.floor(this.textValue));
  }

  private sourceLoad(updateImg?: boolean): any {
    return new Promise((resolve, reject) => {
      if (type(this.fillColor) === 'object' && updateImg) {
        this.drawBackground(); // show background of progress bar when await image load

        const { image } = this.fillColor as fillType;
        const imgInstance = new Image();
        imgInstance.src = image;
        imgInstance.onload = () => {
          this.fillImage = imgInstance;
          resolve(true);
        };
        imgInstance.onerror = (err) => {
          reject(err);
        };
      } else {
        resolve(false);
      }
    });
  }

  private setFillColor(ctx: CanvasRenderingContext2D): void {
    const fillColorType = type(this.fillColor);
    if (fillColorType === 'string') {
      ctx.strokeStyle = this.fillColor as string;
    } else if (fillColorType === 'object' && (<fillType>this.fillColor).image) {
      const pattern = ctx.createPattern(this.fillImage, 'no-repeat');
      ctx.strokeStyle = pattern;
    } else {
      const { gradient: gradientColors } = this.fillColor as fillType;
      const grad = ctx.createLinearGradient(0, 0, this.size, 0);
      const length = gradientColors.length;
      const part = 1 / length;
      let partCount = 0;
      for (let i = 0; i < length; i++) {
        grad.addColorStop(partCount, gradientColors[i]);
        partCount += part;
      }
      ctx.strokeStyle = grad;
    }
  }

  private drawProgress(): void {
    const ctx = this.ctx;
    const halfSize = this.size / 2;
    const { start, end } = this.computedArc();

    ctx.beginPath();
    ctx.lineWidth = this.fillThickness;
    ctx.lineCap = this.lineCap;

    this.setFillColor(ctx);
    const radius = this.isEmptyProgressBig ?
      halfSize - this.fillThickness - (this.thickness - this.fillThickness) :
      halfSize - this.fillThickness;
    ctx.arc(halfSize, halfSize, radius, start, end, false);

    ctx.stroke();
    ctx.closePath();

    this.observer && this.observer(this.percentage, this.currentText);

    if (this.isEnd) {
      this.animationEnd({ progress: this.optionProgress, text: this.text });
    }
  }

  private setText(ctx: CanvasRenderingContext2D, fontSetting: TextStyle): void {
    const { text, size = '14px', color = '#000', x = 10, y = 10, font = 'sans-seri' } = fontSetting;
    const fontSize = parseInt(size, 10) * 2;
    const unit = size.substring(String(fontSize).length) || 'px';

    ctx.font = `${fontSize}${unit} ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x * 2, y * 2);
  }

  private drawText(): void {
    const ctx = this.ctx;
    const text = (this.text && this.computedText());
    this.currentText = text;
    let textContent = [];

    if (text) {
      textContent.push({ text, ...this.textStyle });
    }
    textContent = [...textContent, ...this.customText];
    for (let i = 0; i < textContent.length; i++) {
      this.setText(ctx, textContent[i]);
    }
  }

  private requestAnimationFrame(cb) {
    return window.requestAnimationFrame(cb);
  }

  private accumulation(): void {
    if (this.type === 'increase') {
      this.percentage += this.speed;
      if (this.percentage > this.progress) {
        this.percentage = this.progress;
      }
    } else {
      this.percentage -= this.speed;
      if (this.percentage < this.progress) {
        this.percentage = this.progress;
      }
    }
  }

  private drawProgressAnimate = (): void => {
    if (this.animation === false) {
      this.percentage = this.progress;
    }
    this.isEnd = this.percentage === this.progress;

    this.ctx.clearRect(0, 0, this.size, this.size);
    this.drawBackground();
    this.drawText();
    this.drawProgress();

    if (this.isEnd) return;

    if (this.type === 'increase') {
      this.accumulation();
      this.requestAnimationFrame(this.drawProgressAnimate);
    } else if (this.type === 'decrease') {
      this.accumulation();
      this.requestAnimationFrame(this.drawProgressAnimate);
    }
  }

  private resetOptions = (option: any): void => {
    const { progress, thickness, textStyle, size, speed } = option;
    if (typeof progress === 'number') {
      const setProgress = progress * 100;
      this.type = setProgress > this.progress ? 'increase' : 'decrease';
      this.progress = setProgress;
      this.optionProgress = progress;
    }
    if (thickness) {
      this.thickness = thickness * 2;
    }
    if (textStyle) {
      this.textStyle = { ...this.textStyle, ...textStyle };
    }
    if (size) {
      this.size = size * 2; // HD mode
    }
    if (typeof speed === 'number') {
      this.speedOption = speed;
    }
  }

  public updateProgress(updateOption: Omit<Options, 'el'>): void {
    this.prevProgress = this.progress;
    this.prevText = this.text;
    const { progress, thickness, textStyle, size, speed, ...restOption } = updateOption;
    if (!this.isEnd || this.prevProgress === progress * 100) return;

    this.resetOptions({ progress, thickness, textStyle, size, speed });
    Object.keys(restOption || {}).forEach(key => this[key] = restOption[key]);
    const updateImg = type(restOption.fillColor) === 'object' &&
      !(restOption.fillColor as fillType).image;
    this.init({ updateImg, notCreate: true });
  }

  public destroy(): void {
    const container = this.canvas.parentNode;

    if (container) {
      container.removeChild(this.canvas);
    }
  }
}

export default ArcProgress;
