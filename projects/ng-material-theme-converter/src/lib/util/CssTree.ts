import * as CssTree from "css-tree";
export * from "css-tree";

export default CssTree;

// const cssTree = CssTreeParser as any;
// const f =  cssTree.fork({
//   node: {
//     Url: {
//       generate(node) {
//         this.token(cssTree.tokenTypes.Url, cssTree.string.encode(node.value));
//       }
//     }
//   }
// });

// export const parse = cssTree.parse as typeof CssTreeParser.parse;
// export const generate = cssTree.generate as typeof CssTreeParser.generate;
// export const clone = cssTree.clone as typeof CssTreeParser.clone;
