import ArcProgress from '../src/arc-progress';
import { dateFormat } from './utils';
import * as image from '../static/fill.png';
import '../static/style.css';

// use customText and observer method
const customText = [
  { text: '$', size: '12px', color: '#fff', x: 156, y:98 },
  { text: 'remaining amount', size: '14px', color: '#fff', x: 100, y:150 },
];

const arcProgress = new ArcProgress({
  customText,
  el: '#progress-container',
  progress: .78,
  text: '6439.68',
  size: 200,
  textStyle: { y: 95, size: '24px', color: '#fff' },
  emptyColor: 'rgba(73, 201, 245, .9)',
  fillColor: 'rgba(255, 255, 255, .95)',
  observer(e, t) {
    console.log('observer:', e, t);
  },
  animationEnd(e) {
    console.log('animationEnd', e);
  },
});

document.getElementById('button').addEventListener('click', () => {
  arcProgress.updateProgress({ progress: .89, text: '7347.84' });
}, false);

document.getElementById('button2').addEventListener('click', () => {
  arcProgress.updateProgress({ progress: .31, text: '2559.36' });
}, false);

// demo2 custom thickness
new ArcProgress({
  el: '#progress-container2',
  progress: .68,
  text: '356',
  textStyle: { size: '44px', color: '#7591af' },
  arcStart: -90,
  arcEnd: 270,
  fillThickness: 14,
  thickness: 8,
  emptyColor: '#3d5875',
  fillColor: '#00e0ff',
  animation: 2200,
});

// demo3  today time remaining
function getTodayProgress(): any {
  const oneDayTimeStamp = 86400000;
  const today = new Date();
  const todatTimeStamp = +new Date(today.getFullYear(), today.getMonth(), today.getDate(),
    0, 0, 0, 0);
  const tomorrowTimeStamp = todatTimeStamp + oneDayTimeStamp;
  const todayRemaining = tomorrowTimeStamp - +today;

  const progress = todayRemaining / 86400000;
  const text = dateFormat(todayRemaining + todatTimeStamp, 'hh:mm:ss');

  return { progress, text };
}

const { progress, text } = getTodayProgress();
const customText3 = [
  { text, size: '28px', color: '#02ce9c', x: 100, y:98 },
  { text: 'time remaining', size: '16px', color: '#636467', x: 100, y:128 },
];
const arcProgress3 = new ArcProgress({
  progress,
  el: '#progress-container3',
  size: 200,
  customText: customText3,
  emptyColor: '#3b3a3f',
  fillColor: '#00ce9b',
  lineCap: 'butt',
  arcStart: -90,
  arcEnd: 270,
  animation: false,
});

(function setTime() {
  setTimeout(() => {
    const { progress, text } = getTodayProgress();

    customText3[0].text = text;
    arcProgress3.updateProgress({ progress, customText: customText3 });

    setTime();
  }, 1000);
})();

// demo4 use image fillColor
const customText4 = [
  { text: '%', size: '12px', font: 'Impact', color: '#76a4ef', x: 156, y:104 },
];
const arcProgress4 = new ArcProgress({
  el: document.getElementById('progress-container4'),
  progress: .7826,
  text: '78.26',
  size: 200,
  customText: customText4,
  textStyle: { size: '34px', color: '#76a4ef', font: 'Arial Black' },
  emptyColor: '#ebf4f8',
  fillColor: { image },
  arcStart: -180,
  arcEnd: 180,
  thickness: 18,
  speed: -30,
  animationEnd(e) {
    const { progress } = e;
    setTimeout(() => {
      if (progress === .7826) {
        arcProgress4.updateProgress({ progress: .3423, text: '34.23' });
      } else if (progress === .3423) {
        arcProgress4.updateProgress({ progress: .8016, text: '80.16' });
      }
    }, 500);
  },
});
