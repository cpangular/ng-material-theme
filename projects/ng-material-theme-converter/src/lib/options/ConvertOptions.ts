export interface ConvertOptions {
  readonly component: string;
  readonly write: boolean;
  readonly writeSnapshots: boolean;
  readonly transformations: boolean;
  readonly componentTransformations: boolean;
  readonly colorTransformations: boolean;
  readonly tokenTransformations: boolean;
  readonly densityTransformations: boolean;
  readonly autoColorTransformations: boolean;
  readonly autoDensityTransformations: boolean;
  readonly report: boolean;
  readonly reportColorMode: boolean;
  readonly reportDensity: boolean;
}
