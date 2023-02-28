import { compileString } from "sass";

export class ScssRunner {
  private readonly fs: Record<string, string> = {
    json: `
      @use "sass:meta";
      @function to-json($value) {
        @if $value == null {
          @return 'null';
        }
        @if meta.type-of($value) == number {
          @return $value;
        }
        @if meta.type-of($value) == bool {
          @return if($value, 'true', 'false');
        }
        @if meta.type-of($value) == list {
          $ret: '';
          @each $v in $value {
            $ret: if($ret == '', '', '#{$ret}, ');
            $ret: '#{$ret}#{to-json($v)}';
          }
          @return '[#{$ret}]';
        }
        @if meta.type-of($value) == map {
          $ret: '';
          @each $k, $v in $value {
            $ret: if($ret == '', '', '#{$ret}, ');
            $ret: '#{$ret}#{to-json($k)}: #{to-json($v)}';
          }
          @return '{#{$ret}}';
        }
        @return '"#{$value}"';
      }
    `,
  };

  constructor(fs: Record<string, string>) {
    this.fs = {
      ...(fs ?? {}),
      ...this.fs,
    };
  }

  public call<T = unknown>(file: string, fn: string, args: any[]): T {
    const src = `
      @use "json";
      @use "${file}" as lib;
      ${this.toScssFunctionCall(fn, args)}
    `;
    const result = this.compile(src);
    const m = /\/\*\! (.*?) \*\//;
    const match = result.match(m);
    return JSON.parse(match[1]);
  }

  public include(file: string, mixin: string, args: any[]): string {
    const src = `
      @use "${file}" as lib;
      ${this.toScssIncludeCall(mixin, args)}
    `;
    return this.compile(src);
  }

  public compile(source: string): string {
    const self = this;
    return compileString(source, {
      importers: [
        {
          canonicalize(url) {
            if (self.fs[url]) {
              return new URL("fs:" + url);
            }
            return null;
          },
          load(canonicalUrl) {
            return {
              contents: self.fs[canonicalUrl.pathname],
              syntax: "scss",
            };
          },
        },
      ],
    }).css;
  }

  private toScss(value: any): string {
    return JSON.stringify(value)
      .replaceAll(/[\{\[]/g, "(")
      .replaceAll(/[\}\]]/g, ")");
  }

  private toScssArgList(value: any[]): string {
    return this.toScss(value).slice(1, -1);
  }

  private toScssFunctionCall(fn: string, value: any[]): string {
    return `/*! #{json.to-json(lib.${fn}(${this.toScssArgList(value)}))} */`;
  }

  private toScssIncludeCall(mixin: string, value: any[]): string {
    return `@include lib.${mixin}(${this.toScssArgList(value)})`;
  }
}
