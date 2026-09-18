import { useEffect, useRef, useState } from 'react';
import { readAppData, removeAppData, writeAppData } from '../../State/StorageHelper';
import './RandomPickerWheel.css';

const sectionColors = [
  '#F7D774', '#F6B89E', '#F28F8F', '#F2B5D4', '#D9B8E8', '#B9B2E8',
  '#A9C7F5', '#9DD9F3', '#9ED9D0', '#A8E6CF', '#B8D8BA', '#D7E7A9',
  '#F2E3A9', '#F6D6A8', '#E8C3A8', '#D5C4A1', '#C7D4B8', '#C4D7E6',
];

const defaultSections = [
  { id: 1, name: 'Goldgelb', color: '#F7D774' },
  { id: 2, name: 'Türkis', color: '#9DD9F3' },
  { id: 3, name: 'Mintgrün', color: '#A8E6CF' },
  { id: 4, name: 'Rosa', color: '#F28F8F' },
  { id: 5, name: 'Flieder', color: '#D9B8E8' },
];

function readSavedSections() {
  const savedData = readAppData('random-picker-wheel');
  return Array.isArray(savedData.sections) ? savedData.sections : defaultSections;
}

function getRandomSectionColor(usedColors = []) {
  const availableColors = sectionColors.filter((color) => !usedColors.includes(color));

  if (availableColors.length) {
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }

  let hue = (usedColors.length * 137.508) % 360;
  let color = hslToHex(hue, 60, 78);

  while (usedColors.includes(color)) {
    hue = (hue + 17) % 360;
    color = hslToHex(hue, 60, 78);
  }

  return color;
}

function hslToHex(hue, saturation, lightness) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const hueSegment = hue / 60;
  const secondComponent = chroma * (1 - Math.abs((hueSegment % 2) - 1));
  const match = l - chroma / 2;
  const [red, green, blue] = hueSegment < 1
    ? [chroma, secondComponent, 0]
    : hueSegment < 2
      ? [secondComponent, chroma, 0]
      : hueSegment < 3
        ? [0, chroma, secondComponent]
        : hueSegment < 4
          ? [0, secondComponent, chroma]
          : hueSegment < 5
            ? [secondComponent, 0, chroma]
            : [chroma, 0, secondComponent];
  const toHex = (channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0');

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

export const appMetadata = {
  AppId: 'random-picker-wheel',
  MenuIcon: '🎡',
  MenuName: 'Glücksrad',
  AppName: 'Glücksrad',
  AppUrl: '/random-picker-wheel',
};

function RandomPickerWheel() {
  const [rotation, setRotation] = useState(0);
  const [sections, setSections] = useState(readSavedSections);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(() => getRandomSectionColor());
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
  const nextIdRef = useRef(Math.max(0, ...sections.map((section) => Number(section.id) || 0)) + 1);

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

  const handleAddSection = (event) => {
    event.preventDefault();
    const name = newName.trim() || `Sektion ${sections.length + 1}`;
    setSections((currentSections) => [
      ...currentSections,
      { id: nextIdRef.current++, name, color: newColor },
    ]);
    setNewName('');
    setNewColor(getRandomSectionColor([...sections.map((section) => section.color), newColor]));
  };

  const handleDeleteSection = (id) => {
    setSections((currentSections) => currentSections.filter((section) => section.id !== id));
  };

  const handleClearSections = () => {
    stopInertia();
    stopSpinAnimation();
    setIsMoving(true);
    setIsSpinning(false);
    setIsMoving(false);
    setSections([]);
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
    if (!sections.length) {
      removeAppData('random-picker-wheel');
      return;
    }

    writeAppData('random-picker-wheel', { sections });
  }, [sections]);

  useEffect(() => {
    if (!sections.length) {
      setSelectedIndex(0);
      return;
    }

    const pointerAngle = ((-rotationRef.current % 360) + 360) % 360;
    setSelectedIndex(Math.floor((pointerAngle + sectionAngle / 2) / sectionAngle) % sections.length);
  }, [sections.length, sectionAngle]);

  return (
    <div className="randomPickerWheel">
      <div className="wheelLayout">
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

          {selectedSection && (
            <p className="wheelResult" aria-live="polite">
              Auswahl: <strong>{selectedSection.name}</strong>
            </p>
          )}
        </div>

        <aside className="sectionPanel" aria-label="Sektionen">
          <form className="addSection" onSubmit={handleAddSection}>
            <label className="colorPicker" aria-label="Farbe der neuen Sektion auswählen">
              <span className="colorSwatch" style={{ backgroundColor: newColor }} aria-hidden="true" />
              <input
                type="color"
                value={newColor}
                onChange={(event) => setNewColor(event.target.value)}
                aria-label="Farbe der neuen Sektion"
              />
            </label>
            <input aria-label="Name der neuen Sektion" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Name" />
            <button className="addButton" type="submit" aria-label="Sektion hinzufügen">+</button>
          </form>

          <div className="sectionList">
            {sections.map((section) => (
              <div className="sectionItem" key={section.id}>
                <span className="colorSwatch" style={{ backgroundColor: section.color }} aria-hidden="true" />
                <span className="sectionName">{section.name}</span>
                <button className="deleteButton" type="button" aria-label={`${section.name} löschen`} onClick={() => handleDeleteSection(section.id)}>
                  ×
                </button>
              </div>
            ))}
          </div>

          <button className="clearButton" type="button" onClick={handleClearSections} disabled={!sections.length}>Alle löschen</button>
        </aside>
      </div>
    </div>
  );
}

export default RandomPickerWheel;
