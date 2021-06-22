import image from '../static/fill.png';

// use customText and observer method
const customText = [
  { text: '$', size: '12px', color: '#fff', x: 156, y: 98 },
  { text: 'remaining amount', size: '14px', color: '#fff', x: 100, y:150 },
];

const arcProgress = {
  customText,
  className: 'progress-container',
  size: 200,
  textStyle: { y: 95, size: '24px', color: '#fff' },
  emptyColor: 'rgba(73, 201, 245, .9)',
  fillColor: 'rgba(255, 255, 255, .95)',
};

// demo2 custom thickness
const arcProgress2 = {
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
};

// demo3  today time remaining
const arcProgress3 = {
  size: 200,
  emptyColor: '#3b3a3f',
  fillColor: '#00ce9b',
  arcStart: -90,
  arcEnd: 270,
  animation: false,
};

// demo4 use image fillColor
const customText4 = [
  { text: '%', size: '12px', font: 'Impact', color: '#76a4ef', x: 156, y:104 },
];
const arcProgress4 = {
  size: 200,
  customText: customText4,
  textStyle: { size: '34px', color: '#76a4ef', font: 'Arial Black' },
  emptyColor: '#ebf4f8',
  fillColor: { image },
  arcStart: -180,
  arcEnd: 180,
  thickness: 18,
  speed: -30,
};

const arcProgress5 = {
  size: 200,
  customText: customText4,
  textStyle: { size: '34px', color: '#76a4ef', font: 'Arial Black' },
  emptyColor: '#ebf4f8',
  fillColor: { image },
  arcStart: -180,
  arcEnd: 180,
  thickness: 18,
  speed: -30,
};
export {
  arcProgress,
  arcProgress2,
  arcProgress3,
  arcProgress4,
  arcProgress5,
};
