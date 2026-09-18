import { useState } from 'react';
import { getRandomSectionColor, useRandomPickerWheel } from '../State/RandomPickerWheelContext';
import SectionItem from './SectionItem';
import './SectionList.css';

function SectionList() {
  const { sections, addSection, deleteSection, clearSections } = useRandomPickerWheel();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(() => getRandomSectionColor());

  const handleAddSection = (event) => {
    event.preventDefault();
    const name = newName.trim() || `Sektion ${sections.length + 1}`;
    addSection(name, newColor);
    setNewName('');
    setNewColor(getRandomSectionColor([...sections.map((section) => section.color), newColor]));
  };

  return (
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
          <SectionItem key={section.id} section={section} onDelete={deleteSection} />
        ))}
      </div>

      <button className="clearButton" type="button" onClick={clearSections} disabled={!sections.length}>Alle löschen</button>
    </aside>
  );
}

export default SectionList;
