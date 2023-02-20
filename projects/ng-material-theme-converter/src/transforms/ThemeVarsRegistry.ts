export class ThemeVarsRegistry {
  private static readonly _themeVarPrefix = "--theme";
  private static readonly _vars: Set<string> = new Set();

  public static register(varName: string) {
    varName = `${this._themeVarPrefix}-${varName}`;
    this._vars.add(varName);
    return varName;
  }

  public static get registeredVars() {
    return Array.from(this._vars);
  }
}
