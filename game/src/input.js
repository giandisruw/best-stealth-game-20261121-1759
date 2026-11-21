// Keyboard and mouse input, translated into game coordinates. The canvas is
// scaled to the window, so clicks are mapped back into the 1280x720 field.
import { FIELD } from './config.js';

/**
 * Attach listeners to the canvas and return the live input state:
 * `keys` (a Set of lower-case key names), `onClick` and `onRightClick`
 * callbacks the game wires up, and `detach` to remove the listeners.
 */
export function createInput(canvas) {
  const keys = new Set();
  const state = {
    keys,
    onClick: null,
    onRightClick: null,
    onKey: null,
    detach: null,
  };

  function toField(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    // Clamp to the field: a click on the letterbox margin must not send the
    // courier to a target behind the border wall.
    return {
      x: Math.max(0, Math.min(FIELD.width, ((clientX - rect.left) / rect.width) * FIELD.width)),
      y: Math.max(0, Math.min(FIELD.height, ((clientY - rect.top) / rect.height) * FIELD.height)),
    };
  }

  function onKeyDown(event) {
    const key = event.key.toLowerCase();
    keys.add(key);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
      event.preventDefault();
    }
    if (state.onKey) state.onKey(key);
  }

  function onKeyUp(event) {
    keys.delete(event.key.toLowerCase());
  }

  function onClick(event) {
    if (state.onClick) state.onClick(toField(event.clientX, event.clientY));
  }

  function onContextMenu(event) {
    event.preventDefault();
    if (state.onRightClick) state.onRightClick(toField(event.clientX, event.clientY));
  }

  function onBlur() {
    keys.clear();
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('contextmenu', onContextMenu);

  state.detach = () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    canvas.removeEventListener('click', onClick);
    canvas.removeEventListener('contextmenu', onContextMenu);
  };
  return state;
}
