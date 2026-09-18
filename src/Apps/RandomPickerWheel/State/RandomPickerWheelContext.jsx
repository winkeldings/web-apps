import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { readAppData, removeAppData, writeAppData } from '../../../State/StorageHelper';

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

const RandomPickerWheelContext = createContext(null);

function RandomPickerWheelProvider({ children }) {
  const [sections, setSections] = useState(readSavedSections);
  const [clearVersion, setClearVersion] = useState(0);
  const nextIdRef = useRef(Math.max(0, ...sections.map((section) => Number(section.id) || 0)) + 1);

  useEffect(() => {
    if (!sections.length) {
      removeAppData('random-picker-wheel');
      return;
    }

    writeAppData('random-picker-wheel', { sections });
  }, [sections]);

  const addSection = (name, color) => {
    setSections((currentSections) => [
      ...currentSections,
      { id: nextIdRef.current++, name, color },
    ]);
  };

  const deleteSection = (id) => {
    setSections((currentSections) => currentSections.filter((section) => section.id !== id));
  };

  const clearSections = () => {
    setClearVersion((version) => version + 1);
    setSections([]);
  };

  return (
    <RandomPickerWheelContext.Provider value={{ sections, addSection, deleteSection, clearSections, clearVersion }}>
      {children}
    </RandomPickerWheelContext.Provider>
  );
}

function useRandomPickerWheel() {
  const context = useContext(RandomPickerWheelContext);

  if (!context) {
    throw new Error('useRandomPickerWheel must be used within RandomPickerWheelProvider');
  }

  return context;
}

export {
  RandomPickerWheelProvider,
  getRandomSectionColor,
  useRandomPickerWheel,
};
