interface options {
  width?: number,
  height?: number,
  arcStart?: number,
  arcEnd?: number,
  progress: number,
  el: string | HTMLElement,
}

class ArcProgress {
  public width: number;
  public height: number;
  public el: string | HTMLElement;
  public ctx: any;
  public arcStart: number;
  public arcEnd: number;
  public progress: number;
  private percentage: number = 0;
  private speed: number = 0.01;

  constructor({width, height, el, arcStart, arcEnd, progress}: options) {
    this.width = width || 200;
    this.height = height || 200;
    this.arcStart = arcStart || 0.8;
    this.arcEnd = arcEnd || 2.2;
    this.progress = progress;
    this.el = el;

    console.log(11111)
    this.init();
  }

  private init() {
    const el = typeof this.el === 'string' ? document.querySelector(this.el) : this.el;
    console.log(el)
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

    ctx.beginPath();
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#efefef'; // 设置圆环的颜色

    ctx.arc(100, 100, 100 - 12 , PI * this.arcStart, PI * this.arcEnd, false);
    ctx.stroke();
    ctx.closePath();
  }

  private drawPregress() {
    const ctx = this.ctx;
    const PI = Math.PI;

    const degreeCount = this.arcEnd - this.arcStart;
    const progress = degreeCount * this.percentage + this.arcStart;

    ctx.beginPath();
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6bd5c8'; // 设置圆环的颜色

    ctx.arc(100, 100, 100 - 12 , PI * this.arcStart, PI * progress , false);

    ctx.stroke();
    ctx.closePath();
  }

  private drawText() {
    const ctx = this.ctx;

    ctx.beginPath()
    ctx.fillStyle = '#000000';
    ctx.font = '40px';
    // ctx.setTextAlign('center');
    ctx.fillText(`${this.percentage * 100}`, 60, 75);
    ctx.closePath();
    // ctx.setFontSize(14);
    // ctx.fillText('%', 90, 75);
    // // ctx.setFontSize(14);
    // ctx.fillText('总完成情况', 70, 110);


    // const degreeCount = this.arcEnd - this.arcStart;
    // const progress = degreeCount * this.percentage + this.arcStart;
    //
    // ctx.beginPath();
    // ctx.lineWidth = 12;
    // ctx.lineCap = 'round';
    // ctx.strokeStyle = '#6bd5c8'; // 设置圆环的颜色
    //
    // ctx.arc(100, 100, 100 - 12 , PI * this.arcStart, PI * progress , false);
    //
    // ctx.stroke();
    // ctx.closePath();
  }

  private requestAnimationFrame(cb) {
    return window.requestAnimationFrame(cb);
  }

  private accumulation() {
    this.percentage += this.speed
  }

  private drawPregressAnimate = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
    this.drawPregress();
    this.drawText();

    if (this.percentage < this.progress) {
      this.accumulation();
      this.requestAnimationFrame(this.drawPregressAnimate);
    }

  }




  }

export default ArcProgress;
