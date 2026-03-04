import { screen, Display } from "electron";

/**
 * Looks up the target display using the 'primary' or 'secondary' notions.
 * 
 * @param target - The display to look up. The following values are supported:
 *  - 'primary': Get the primary display, as defined by the os.
 *  - 'secondary': Get the first display, not set as the primary display.
 *  - number: Returns the display at the specified index, or the primary display if not found.
 * @returns - The specified display.
 */
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