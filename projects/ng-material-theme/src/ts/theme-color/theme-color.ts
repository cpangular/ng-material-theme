interface ThemeColorProperties {
  default: string;
  [key: string]: string;
}

type ThemeColorVariations = {
  [key: string]: ThemeColorProperties;
};

type ThemeColorAliases = {
  [key: string]: string;
};

interface ThemeColor {
  properties: ThemeColorProperties;
  contrast?: boolean | ThemeColorProperties;
  refs?: ThemeColorAliases;
  tint?: boolean | ThemeColorProperties;
  variations: ThemeColorVariations;
  aliases: ThemeColorAliases;
}
