import { screen, Display } from "electron";

export function getTargetDisplay(target: 'primary' | 'secondary' | number): Display {
  const displays = screen.getAllDisplays();
  if (target === 'primary') {
    return screen.getPrimaryDisplay();
  }
  if (target === 'secondary') {
    const primaryId = screen.getPrimaryDisplay().id;
    return displays.find(d => d.id !== primaryId) ?? screen.getPrimaryDisplay();
  }
  return displays[target] ?? screen.getPrimaryDisplay();
}