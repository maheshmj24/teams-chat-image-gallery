import { useContext } from 'react';
import { ChatImageGallery } from './ChatImageGallery';
import { TeamsFxContext } from './Context';

export default function Tab() {
  const { themeString } = useContext(TeamsFxContext);

  let themeClassName = 'light';
  if (themeString === 'dark') {
    themeClassName = 'dark';
  } else if (themeString === 'contrast') {
    themeClassName = 'contrast';
  }

  return (
    <div className={themeClassName}>
      <ChatImageGallery />
    </div>
  );
}
