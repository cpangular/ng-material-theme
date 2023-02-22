export function colorKey(palette: string, variation?: string, property?: string, isRef: boolean = false) {
  if (property === "default") {
    property = undefined;
  }
  const key = [`--theme-color${isRef ? "-ref" : ""}--${palette}`];

  if (variation !== undefined) {
    key.push(variation);
  }
  if (property !== undefined) {
    key.push(property);
  }
  return key.join("--");
}
