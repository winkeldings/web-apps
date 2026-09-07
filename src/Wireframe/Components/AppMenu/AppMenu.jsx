import { useState } from 'react';
import { Button } from '@base-ui/react';
import { appGroups, homeApp } from '../../../Apps/Apps';

function AppMenu({ selectedApp, onAppSelect }) {
  const [openGroups, setOpenGroups] = useState(
    Object.fromEntries(appGroups.map((group) => [group.name, true])),
  );

  const toggleGroup = (groupName) => {
    setOpenGroups((groups) => ({ ...groups, [groupName]: !groups[groupName] }));
  };

  return (
    <aside className="sidebar" aria-label="App-Menü">
      <p className="menuLabel">Apps</p>
      <nav>
        <Button
          className={`appButton homeButton ${selectedApp.MenuName === homeApp.MenuName ? 'selected' : ''}`}
          onClick={() => onAppSelect(homeApp)}
        >
          <span className="appIcon" aria-hidden="true">{homeApp.MenuIcon}</span>
          <span>{homeApp.MenuName}</span>
        </Button>
        {appGroups.map((group) => (
          <div className="group" key={group.name}>
            <Button
              className="groupButton"
              aria-expanded={openGroups[group.name]}
              onClick={() => toggleGroup(group.name)}
            >
              <span className="groupIcon" aria-hidden="true">{group.icon}</span>
              <span>{group.name}</span>
              <span className={`chevron ${openGroups[group.name] ? 'expanded' : ''}`} aria-hidden="true" />
            </Button>
            {openGroups[group.name] && (
              <div className="appList">
                {group.apps.map((app) => (
                  <Button
                    className={`appButton ${selectedApp.MenuName === app.MenuName ? 'selected' : ''}`}
                    key={app.MenuName}
                    onClick={() => onAppSelect(app)}
                  >
                    <span className="appIcon" aria-hidden="true">{app.MenuIcon}</span>
                    <span>{app.MenuName}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default AppMenu;