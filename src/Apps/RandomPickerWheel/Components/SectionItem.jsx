import './SectionItem.css';

function SectionItem({ section, onDelete }) {
  return (
    <div className="sectionItem">
      <span className="colorSwatch" style={{ backgroundColor: section.color }} aria-hidden="true" />
      <span className="sectionName">{section.name}</span>
      <button className="deleteButton" type="button" aria-label={`${section.name} löschen`} onClick={() => onDelete(section.id)}>
        ×
      </button>
    </div>
  );
}

export default SectionItem;
