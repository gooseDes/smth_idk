function hasMouseOrKeyboard() {
  return window.matchMedia("(pointer: fine)").matches;
}

function hasKeyboard() {
  return 'onkeydown' in window;
}

function hasTouchScreen() {
  return (
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    navigator.msMaxTouchPoints > 0
  );
}


export function detectInputDevices() {
  const mouseOrKeyboard = hasMouseOrKeyboard() || hasKeyboard();
  const touch = hasTouchScreen();

  return {
    mouseOrKeyboard,
    touch,
    primaryInput: touch ? 'touch' : 'mouse'
  };
}