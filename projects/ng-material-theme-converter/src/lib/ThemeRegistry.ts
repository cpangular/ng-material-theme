import Enumerable from "linq";

export class ThemeRegistry {
  private static readonly _vars: Set<string> = new Set();

  public static registerVariable(theme: string, varName: string) {
    this._vars.add(`${theme}|${varName}`);
    return varName;
  }

  public static get variablesQuery() {
    return Enumerable.from(this._vars.values()).select((v) => {
      const [theme, name] = v.split("|", 2);
      return {
        theme,
        name,
      };
    });
  }

  public static get registeredVariables() {
    return this.variablesQuery.toArray();
  }

  public static get registeredVariableNames() {
    return this.variablesQuery
      .select((v) => v.name)
      .distinct()
      .toArray();
  }

  public static get registeredThemes() {
    return this.variablesQuery
      .select((v) => v.theme)
      .distinct()
      .toArray();
  }

  public static get registeredThemeVariables(): Record<string, string[]> {
    return this.variablesQuery
      .groupBy(
        (v) => v.theme,
        (v) => v.name,
        (theme, g) => ({
          theme,
          variables: g.distinct().toArray(),
        })
      )
      .toObject(
        (v) => v.theme,
        (v) => v.variables
      ) as Record<string, string[]>;
  }
}
