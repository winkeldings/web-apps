import { useEffect, useRef, useState } from 'react';
import { useRandomPickerWheel } from '../State/RandomPickerWheelContext';
import SelectionResult from './SelectionResult';
import './Wheel.css';

function Wheel() {
  const { sections, clearVersion } = useRandomPickerWheel();
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const wheelRef = useRef(null);
  const rotationRef = useRef(rotation);
  const velocityRef = useRef(0);
  const inertiaTimeRef = useRef(0);
  const animationFrameRef = useRef(null);
  const dragRef = useRef(null);
  const spinAnimationRef = useRef(null);
  const spinDirectionRef = useRef(1);

  const sectionAngle = sections.length ? 360 / sections.length : 360;
  const selectedSection = sections[selectedIndex] || null;

  const normalizeAngle = (angle) => ((angle + 180) % 360 + 360) % 360 - 180;

  const updateRotation = (nextRotation) => {
    rotationRef.current = nextRotation;
    setRotation(nextRotation);

    const pointerAngle = ((-nextRotation % 360) + 360) % 360;
    setSelectedIndex(sections.length
      ? Math.floor((pointerAngle + sectionAngle / 2) / sectionAngle) % sections.length
      : 0);
  };

  const stopInertia = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const stopSpinAnimation = () => {
    if (spinAnimationRef.current !== null) {
      cancelAnimationFrame(spinAnimationRef.current);
      spinAnimationRef.current = null;
    }
  };

  const animateInertia = () => {
    const dampingProgress = Math.min(inertiaTimeRef.current / 8000, 1);
    const damping = 0.998 - dampingProgress * 0.043;
    const nextVelocity = velocityRef.current * damping;

    if (Math.abs(nextVelocity) < 0.00008) {
      velocityRef.current = 0;
      inertiaTimeRef.current = 0;
      animationFrameRef.current = null;
      setIsMoving(false);
      return;
    }

    velocityRef.current = nextVelocity;
    inertiaTimeRef.current += 16;
    updateRotation(rotationRef.current + nextVelocity * 16);
    animationFrameRef.current = requestAnimationFrame(animateInertia);
  };

  const getPointerAngle = (event) => {
    const bounds = wheelRef.current.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    return Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI) + 90;
  };

  const handlePointerDown = (event) => {
    if (isSpinning || event.target.closest('button')) return;
    stopInertia();
    wheelRef.current.setPointerCapture(event.pointerId);
    setIsMoving(true);
    dragRef.current = {
      lastAngle: getPointerAngle(event),
      lastTime: event.timeStamp,
    };
    velocityRef.current = 0;
    inertiaTimeRef.current = 0;
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;

    const currentAngle = getPointerAngle(event);
    const delta = normalizeAngle(currentAngle - dragRef.current.lastAngle);
    const elapsed = Math.max(event.timeStamp - dragRef.current.lastTime, 1);

    const naturalVelocity = delta / elapsed;
    const speed = Math.abs(naturalVelocity);
    const boostStart = 0.45;
    const boostFull = 0.9;
    const boostRange = Math.min(Math.max((speed - boostStart) / (boostFull - boostStart), 0), 1);
    const smoothBoost = boostRange * boostRange * (3 - 2 * boostRange);
    const boostedVelocity = naturalVelocity * 3.8;

    velocityRef.current = naturalVelocity + (boostedVelocity - naturalVelocity) * smoothBoost;
    updateRotation(rotationRef.current + delta);
    dragRef.current = { lastAngle: currentAngle, lastTime: event.timeStamp };
  };

  const handlePointerUp = (event) => {
    if (!dragRef.current) return;

    dragRef.current = null;
    wheelRef.current.releasePointerCapture(event.pointerId);
    inertiaTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(animateInertia);
  };

  const handleSpin = (event) => {
    event.stopPropagation();
    if (!sections.length || isSpinning) return;

    stopInertia();
    stopSpinAnimation();
    const targetIndex = Math.floor(Math.random() * sections.length);
    const direction = spinDirectionRef.current;
    spinDirectionRef.current *= -1;
    const turns = 15 + Math.random() * 3;
    const targetBase = -targetIndex * sectionAngle;
    const startRotation = rotationRef.current;
    const fullSpinTarget = startRotation + direction * turns * 360;
    const targetRotation = direction > 0
      ? fullSpinTarget + ((targetBase - fullSpinTarget) % 360 + 360) % 360
      : fullSpinTarget - ((fullSpinTarget - targetBase) % 360 + 360) % 360;
    const startTime = performance.now();
    const duration = 6500 + turns * 90;

    setIsSpinning(true);
    setIsMoving(true);

    const animateSpin = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - ((1 - progress) ** 4);
      updateRotation(startRotation + (targetRotation - startRotation) * easedProgress);

      if (progress < 1) {
        spinAnimationRef.current = requestAnimationFrame(animateSpin);
      } else {
        spinAnimationRef.current = null;
        setIsSpinning(false);
        setIsMoving(false);
        updateRotation(targetRotation);
      }
    };

    spinAnimationRef.current = requestAnimationFrame(animateSpin);
  };

  useEffect(() => () => {
    stopInertia();
    stopSpinAnimation();
  }, []);

  useEffect(() => {
    if (!clearVersion) return;

    stopInertia();
    stopSpinAnimation();
    setIsSpinning(false);
    setIsMoving(false);
  }, [clearVersion]);

  useEffect(() => {
    if (!sections.length) {
      setSelectedIndex(0);
      return;
    }

    const pointerAngle = ((-rotationRef.current % 360) + 360) % 360;
    setSelectedIndex(Math.floor((pointerAngle + sectionAngle / 2) / sectionAngle) % sections.length);
  }, [sections.length, sectionAngle]);

  return (
    <div className="wheelColumn">
      <div className="wheelStage">
        <div className="wheelPointer" aria-hidden="true" />
        <div
          className="wheel"
          ref={wheelRef}
          role="application"
          aria-label="Interaktives Glücksrad"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: sections.length
              ? `conic-gradient(from ${-sectionAngle / 2}deg, ${sections.map((section, index) => `${section.color} ${index * sectionAngle}deg ${(index + 1) * sectionAngle}deg`).join(', ')})`
              : '#d8dee6',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <button className={`wheelStart ${!sections.length ? 'wheelStartEmpty' : ''}`} type="button" aria-label="Glücksrad starten" style={{ transform: `translate(-50%, -50%) rotate(${-rotation}deg)` }} disabled={!sections.length || isSpinning} onPointerDown={(event) => event.stopPropagation()} onClick={handleSpin}>
            {!isMoving && 'Start'}
          </button>
        </div>
      </div>
      <SelectionResult section={selectedSection} />
    </div>
  );
}

export default Wheel;
