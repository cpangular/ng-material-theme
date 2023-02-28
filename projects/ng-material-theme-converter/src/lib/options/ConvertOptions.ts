export interface ConvertOptions {
  readonly component: string;
  readonly cache: boolean;
  readonly write: boolean;
  readonly writeSnapshots: boolean;
  readonly transformations: boolean;
  readonly report: boolean;
  readonly reportColorMode: boolean;
  readonly reportDensity: boolean;
}
