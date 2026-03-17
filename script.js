.lcd-track {
  position: relative;
  z-index: 6;
  font-size: 10px;
  line-height: 1.15;
  overflow: hidden;
  white-space: nowrap;
}

.lcd-track-text {
  display: inline-block;
  min-width: 100%;
  padding-right: 18px;
}

.lcd-track.is-marquee .lcd-track-text {
  animation: lcdMarquee 8s linear infinite;
}

@keyframes lcdMarquee {
  0% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(0);
  }
  90% {
    transform: translateX(calc(-100% + 100px));
  }
  100% {
    transform: translateX(calc(-100% + 100px));
  }
}
