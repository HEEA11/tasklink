const track = document.getElementById("track");

const mountainImages = [
  "산1.png",
  "산2.png",
  "산3.png",
  "산4.png",
  "산5.png",
  "산6.png"
];

for (let i = 0; i < 120; i++) {
  const img = document.createElement("img");

  const randomIndex = Math.floor(Math.random() * mountainImages.length);
  img.src = mountainImages[randomIndex];

  img.classList.add("mountain");

const left = i * 8;








/* 산이 한 곳에 몰리지 않게 높이 구간을 나눔 */
let top;

if (i % 3 === 0) {
  top = 18 + Math.random() * 18; 
} else if (i % 3 === 1) {
  top = 35 + Math.random() * 18;
} else {
  top = 52 + Math.random() * 18;
}

const width = 26 + Math.random() * 22;


  img.style.left = left + "vw";
  img.style.top = top + "vh";
  img.style.width = width + "vw";

  img.style.zIndex = Math.floor(top + width);

  track.appendChild(img);
}

// 클릭 시 object 이미지 순서대로 생성
const objectImages = [
  'object1.png',
  'object2.png',
  'object3.png',
  'object4.png',
  'object5.png',
  'object6.png',
  'object7.png',
  'object8.png',
  'object9.png',
  'object10.png'
];
let objectIndex = 0;

document.addEventListener('click', function (e) {
  const img = document.createElement('img');

  img.src = objectImages[objectIndex];
  img.classList.add('click-object');

  img.style.left = e.clientX + 'px';
  img.style.top = e.clientY + 'px';

  const randomRotate = -25 + Math.random() * 50;
  img.style.setProperty('--rotate', randomRotate + 'deg');

  document.body.appendChild(img);

  objectIndex++;

  if (objectIndex >= objectImages.length) {
    objectIndex = 0;
  }
});