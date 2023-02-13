export function replaceVariable(varName: string, searchValue: string, newValue: string) {
  return (css: string) => {
    return css.replaceAll(`--${varName}: ${searchValue}`, `--${varName}: ${newValue}`);
  };
}
