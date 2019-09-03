import {isInt} from './utils';

interface options {
  width?: number,
  height?: number,
  arcStart?: number,
  arcEnd?: number,
  progress: number,
  value?: string,
  thickness?: number,
  emptyColor?: string,
  fillColor?: string,
  lineCap?: string,
  el: string | HTMLElement,
  animationEnd?: (any) => void,
}

interface updateOptions {
  width?: number,
  height?: number,
  arcStart?: number,
  arcEnd?: number,
  progress: number,
  value?: string,
  el?: string | HTMLElement,
}

class ArcProgress {
  public width: number;
  public height: number;
  public el: string | HTMLElement;
  public ctx: any;
  public arcStart: number;
  public arcEnd: number;
  public progress: number;
  public value: string;
  private percentage: number = 0;
  private speed: number = 1;
  private textValue: number = 0;
  private type: string = 'increase';
  private isEnd: boolean = false;
  private thickness: number;
  private animationEnd: (any) => void;
  private emptyColor: string = '#efefef';
  private fillColor: string = '#6bd5c8';
  private lineCap: string = 'round';

  constructor({width, height, el, arcStart, arcEnd, progress, value, thickness, emptyColor, fillColor, lineCap, animationEnd = () => {}}: options) {
    this.width = width || 200;
    this.height = height || 200;
    this.arcStart = arcStart || 144;
    this.arcEnd = arcEnd || 396;
    this.progress = progress * 100;
    this.value = value;
    this.el = el;
    this.thickness = thickness || 12;
    this.animationEnd = animationEnd;
    this.emptyColor = emptyColor || this.emptyColor;
    this.fillColor = fillColor || this.fillColor;
    this.lineCap = lineCap || this.lineCap;

    this.init();
  }

  private init() {
    const el = typeof this.el === 'string' ? document.querySelector(this.el) : this.el;
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    el.appendChild(canvas);
    this.ctx = canvas.getContext('2d');

    this.drawPregressAnimate();
  }

  private drawBackground() {
    const ctx = this.ctx;
    const PI = Math.PI;
    const conversionRate = 180; //  360/2
    const start = this.arcStart / conversionRate * PI;
    const end = this.arcEnd / conversionRate * PI;

    ctx.beginPath();
    ctx.lineWidth = this.thickness;
    ctx.lineCap = this.lineCap;
    ctx.strokeStyle = this.emptyColor;

    ctx.arc(100, 100, 100 - this.thickness, start, end, false);
    ctx.stroke();
    ctx.closePath();
  }

  private computedArc() {
    const PI = Math.PI;
    const conversionRate = 180; //  360/2

    const start = this.arcStart / conversionRate;
    const end = this.arcEnd / conversionRate;

    const degreeCount = end - start;
    const progress = degreeCount * (this.percentage/100) + start;
    const endPI = progress * PI;

    const startPI = start * PI;

    return {start: startPI, end: endPI};
  }

  private drawPregress() {
    const ctx = this.ctx;

    const {start, end} = this.computedArc();

    ctx.beginPath();
    ctx.lineWidth = this.thickness;
    ctx.lineCap = this.lineCap;
    ctx.strokeStyle = this.fillColor;

    ctx.arc(100, 100, 100 - this.thickness, start, end, false);

    ctx.stroke();
    ctx.closePath();
    if (this.isEnd) {
      this.animationEnd(this);
    }
  }

  private drawText() {
    const ctx = this.ctx;
    const frequency = this.progress / this.speed;

    let increaseValue = Number(this.value) / frequency;
    let decimal: number;
    let text: string;

    const isIntValue = isInt(Number(this.value));
    if (isIntValue) {
      increaseValue = Math.floor(increaseValue);
      if (!(increaseValue % 5)) {
        increaseValue -= 1;
      }
      console.log(increaseValue)
    } else {
      decimal = this.value.split('.')[1].length;
      console.log(decimal)

      increaseValue = Number(increaseValue.toFixed(decimal));


      if (!(increaseValue * Math.pow(10,decimal) % 5)) {
        increaseValue -= 1 / Math.pow(10,decimal);
      }

      console.log(increaseValue)
    }
    this.textValue += increaseValue;

    if (this.isEnd) {
      this.textValue = Number(this.value);
      text = this.value;
    } else if (!isIntValue) {
      text = this.textValue.toFixed(decimal)
    } else {
      text = String(this.textValue);
    }

    ctx.fillStyle = '#000000';
    ctx.font = '40px';
    ctx.fillText(text, 60, 75);
  }

  private requestAnimationFrame(cb) {
    return window.requestAnimationFrame(cb);
  }

  private accumulation() {
    if (this.type === 'increase') {
      this.percentage += this.speed;
    } else {
      this.percentage -= this.speed;
    }
  }

  private drawPregressAnimate = () => {
    this.isEnd = this.percentage === this.progress;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
    this.drawText();
    this.drawPregress();

    if (this.type === 'increase' && this.percentage < this.progress) {
      this.accumulation();
      this.requestAnimationFrame(this.drawPregressAnimate);
    } else if (this.type === 'reduce' && this.percentage > this.progress) {
      this.accumulation();
      this.requestAnimationFrame(this.drawPregressAnimate);
    }
  }

  public updateProgress({progress, value}: updateOptions) {
    if (!this.isEnd) return;
    this.type = progress * 100 > this.progress ? 'increase' : 'reduce';

    this.progress = progress * 100;
    this.value = value;
    this.drawPregressAnimate();
  }

}

export default ArcProgress;
