interface options {
    width?: number;
    height?: number;
    arcStart?: number;
    arcEnd?: number;
    progress: number;
    el: string | HTMLElement;
}
declare class ArcProgress {
    width: number;
    height: number;
    el: string | HTMLElement;
    ctx: any;
    arcStart: number;
    arcEnd: number;
    progress: number;
    private percentage;
    private speed;
    constructor({ width, height, el, arcStart, arcEnd, progress }: options);
    private init;
    private drawBackground;
    private drawPregress;
    private drawText;
    private requestAnimationFrame;
    private accumulation;
    private drawPregressAnimate;
}
export default ArcProgress;
