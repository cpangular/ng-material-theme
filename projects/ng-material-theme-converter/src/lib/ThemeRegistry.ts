import Enumerable from "linq";

export class ThemeRegistry {
  private static readonly _vars: Set<string> = new Set();
  private static readonly _gen_vars: Set<string> = new Set();

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

  public static registerGeneratedVariable(theme: string, varName: string) {
    this._gen_vars.add(`${theme}|${varName}`);
    return varName;
  }

  public static get generatedVariablesQuery() {
    return Enumerable.from(this._gen_vars.values()).select((v) => {
      const [theme, name] = v.split("|", 2);
      return {
        theme,
        name,
      };
    });
  }

  public static get registeredGeneratedVariables() {
    return this.generatedVariablesQuery.toArray();
  }

  public static get registeredGeneratedVariableNames() {
    return this.generatedVariablesQuery
      .select((v) => v.name)
      .distinct()
      .toArray();
  }

  public static get registeredGeneratedThemes() {
    return this.generatedVariablesQuery
      .select((v) => v.theme)
      .distinct()
      .toArray();
  }

  public static get registeredGeneratedThemeVariables(): Record<string, string[]> {
    return this.generatedVariablesQuery
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
