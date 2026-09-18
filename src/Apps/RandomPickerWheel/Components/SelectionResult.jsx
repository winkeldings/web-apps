import './SelectionResult.css';

function SelectionResult({ section }) {
  if (!section) return null;

  return (
    <p className="wheelResult" aria-live="polite">
      Auswahl: <strong>{section.name}</strong>
    </p>
  );
}

export default SelectionResult;
