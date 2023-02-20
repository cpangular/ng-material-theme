// import chalk from "chalk";
// import * as CssTree from "css-tree";
// import { mkdirSync, writeFileSync } from "fs";
// import Enumerable from "linq";
// import Path from "path";
// import { format } from "prettier";
// import { compileNgMaterialTemplate } from "../compiler/compile-ng-material-theme";
// import { CssProperty } from "./types/CssProperty";
// import { CssPropertyReport } from "./report/CssPropertyReport";
// import { CssTransformHandler } from "./types/CssTransformHandler";
// import { ThemeConfig } from "./types/ThemeConfig";
// import { CssPropertyModificationReport } from "./report/CssPropertyModificationReport";
// import { CssRuleReport } from "./report/CssRuleReport";
// import { CssChangeReport } from "./report/CssChangeReport";
// import { CssModeChangeReport } from "./report/CssModeChangeReport";
// import { CssDensityChangeReport } from "./report/CssDensityChangeReport";

// export function transformAst(transforms: CssTransformHandler[], templateName: string, darkMode: boolean = false, density: number = 0) {
//   const result = compileNgMaterialTemplate(templateName, darkMode, density);
//   const ast = CssTree.parse(result.css);
//   CssTree.walk(ast, function (node, item, list) {
//     if (node.type === "Declaration") {
//       const selector = CssTree.generate(this.rule.prelude);

//       const prop: CssProperty = {
//         templateName,
//         selector,
//         propertyName: node.property,
//         value: node.value,
//       };

//       const config: ThemeConfig = {
//         darkMode,
//         density: density ? -2 : 0,
//       };

//       transforms
//         .filter((t) => t.appliesToTheme(templateName) && t.appliesToSelector(selector) && t.appliesToProperty(prop))
//         .forEach((t) => {
//           let r = t.transform(prop, config);
//           if (r !== undefined && r !== null) {
//             switch (typeof r) {
//               case "number":
//               case "string":
//                 r = {
//                   type: "Raw",
//                   value: "" + r,
//                 };
//                 break;
//             }
//             node.value = r;
//           }
//         });
//     }
//   });
//   return ast as CssTree.StyleSheet;
// }

// export function transformNgMaterialTemplate(
//   transforms: CssTransformHandler[],
//   templateName: string,
//   darkMode: boolean = false,
//   density: number = 0
// ) {
//   return format(CssTree.generate(transformAst(transforms, templateName, darkMode, density)), { parser: "css", tabWidth: 2 });
// }

// // interface CssDeclaration {
// //   selector: string,
// //   declaration: CssTree.Declaration,
// //   //list
// // }

// // interface CssDiff {
// //   darkMode?: boolean;
// //   density?: number;
// //   added: CssDeclaration[];
// //   removed: CssDeclaration[];
// //   changed: CssDeclaration[];
// // }

// // function compareAsts(a: CssTree.CssNode, b: CssTree.CssNode): CssDiff {
// //   const added: CssDeclaration[] = [];
// //   const removed: CssDeclaration[] = [];
// //   const changed: CssDeclaration[] = [];

// //   CssTree.walk(a, function (aNode, _, list) {
// //     if (aNode.type === 'Declaration') {
// //       const selector = CssTree.generate(this.rule.prelude);
// //       const bNode = findMatchingNode(b, selector, aNode);
// //       if (!bNode) {
// //         removed.push({ selector, declaration: aNode });
// //       } else {
// //         if (CssTree.generate(aNode.value) !== CssTree.generate(bNode.value)) {
// //           changed.push({ selector, declaration: bNode });
// //         }
// //       }
// //     }
// //   });
// //   CssTree.walk(b, function (bNode) {
// //     if (bNode.type === 'Declaration') {
// //       const selector = CssTree.generate(this.rule.prelude);
// //       const aNode = findMatchingNode(a, selector, bNode);
// //       if (!aNode) {
// //         added.push({ selector, declaration: bNode });
// //       }
// //     }
// //   });

// //   return {
// //     added,
// //     removed,
// //     changed
// //   };
// // }

// // function findMatchingNode(inCss: CssTree.CssNode, selector: string, find: CssTree.Declaration) {
// //   return CssTree.find(inCss, function (n) {
// //     return n.type === 'Declaration' &&
// //       n.property === find.property &&
// //       CssTree.generate(this.rule.prelude) === selector;
// //   }) as CssTree.Declaration | undefined;
// // }

// // function printDiff(stylesheet: CssTree.StyleSheet, diff: CssDiff, compareName: string) {
// //   diff.changed.forEach(node => {
// //     const current = findMatchingNode(stylesheet, node.selector, node.declaration);
// //     console.info(chalk.gray(`[${chalk.yellowBright('Change')}] Property ${chalk.cyanBright(node.declaration.property)} is different`));
// //     console.info(chalk.gray('selector:'), node.selector);
// //     console.info(chalk.blueBright(compareName + ':'), chalk.cyanBright(current.property) + ':', chalk.yellowBright(CssTree.generate(current.value)));
// //     console.info(chalk.blueBright('dark-mode:'), chalk.cyanBright(node.declaration.property) + ':', chalk.yellowBright(CssTree.generate(node.declaration.value)));
// //     console.info();
// //   });

// //   diff.added.forEach(node => {
// //     console.info(chalk.gray(`[${chalk.greenBright('Added')}] Property ${chalk.cyanBright(node.declaration.property)} has been added in ${chalk.blueBright(compareName)}.`));
// //     console.info(chalk.gray('selector:'), node.selector);
// //     console.info(chalk.gray('value:'), chalk.cyanBright(node.declaration.property) + ':', chalk.greenBright(CssTree.generate(node.declaration.value)));
// //     console.info();
// //   });

// //   diff.removed.forEach(node => {
// //     console.info(chalk.gray(`[${chalk.redBright('Removed')}] Property ${chalk.cyanBright(node.declaration.property)} has been removed in ${chalk.blueBright(compareName)}.`));
// //     console.info(chalk.gray('selector:'), node.selector);
// //     console.info(chalk.gray('value:'), chalk.cyanBright(node.declaration.property) + ':', chalk.redBright(CssTree.generate(node.declaration.value)));
// //     console.info();
// //   });
// // }

// function styleSheetToProperties(source: string, stylesheet: CssTree.StyleSheet, darkMode: boolean, density: number) {
//   const props: CssPropertyReport[] = [];
//   CssTree.walk(stylesheet, function (node) {
//     if (node.type === "Declaration") {
//       const selector = CssTree.generate(this.rule.prelude);
//       props.push({
//         source,
//         darkMode,
//         density,
//         selector,
//         name: node.property,
//         value: CssTree.generate(node.value),
//         important: !!node.important,
//       });
//     }
//   });
//   return props;
// }

// export interface CssTransformResult {
//   css: string;
//   report: CssRuleReport[];
// }

// export function transformNgMaterialTemplateAndCompare(transforms: CssTransformHandler[], templateName: string): CssTransformResult {
//   // Dark mode dense - has all the rules
//   const themeBase = transformAst(transforms, templateName, true, -2);
//   const themeDense1 = transformAst(transforms, templateName, true, -1);
//   const themeDense0 = transformAst(transforms, templateName, true, 0);
//   const themeLight = transformAst(transforms, templateName, false, -2);

//   const props = [
//     styleSheetToProperties(templateName, themeBase, true, -2),
//     styleSheetToProperties(templateName, themeDense1, true, -1),
//     styleSheetToProperties(templateName, themeDense0, true, 0),
//     styleSheetToProperties(templateName, themeLight, false, -2),
//   ].flat();

//   var report = Enumerable.from(props).groupBy(
//     (p) => p.selector,
//     (p) => p,
//     (selector, props) => {
//       return {
//         selector,
//         source: props.first().source,
//         properties: props
//           .groupBy(
//             (p) => p.name,
//             (p) => p,
//             (name, p) => {
//               const currentValue = p
//                 .where((i) => i.darkMode === true && i.density === -2)
//                 .select((i) => i.value)
//                 .firstOrDefault();
//               const colorValue = p
//                 .where((i) => i.darkMode === false && i.density === -2)
//                 .select((i) => i.value)
//                 .firstOrDefault();
//               const dense1Value = p
//                 .where((i) => i.darkMode === true && i.density === -1)
//                 .select((i) => i.value)
//                 .firstOrDefault();
//               const dense0Value = p
//                 .where((i) => i.darkMode === true && i.density === 0)
//                 .select((i) => i.value)
//                 .firstOrDefault();

//               let change: CssChangeReport | undefined;
//               if (currentValue !== colorValue) {
//                 change = {
//                   scope: "mode",
//                   darkModeValue: currentValue,
//                   lightModeValue: colorValue,
//                 } as CssModeChangeReport;
//               } else if (currentValue !== dense1Value || currentValue !== dense0Value) {
//                 change = {
//                   scope: "density",

//                   values: {
//                     "-1": dense1Value,
//                     "-2": dense0Value,
//                     "0": currentValue,
//                   },
//                 } as CssDensityChangeReport;
//               }

//               return {
//                 name,
//                 value: currentValue,
//                 change,
//               } as CssPropertyModificationReport;
//             }
//           )
//           .toArray(),
//       } as CssRuleReport;
//     }
//   );

//   //console.log(b.where(i => !!i.properties.find(j => !!j.change)).select(i => i.properties.map(j => j.change)).toArray());
//   return {
//     css: format(CssTree.generate(themeBase), { parser: "css", tabWidth: 2 }),
//     report: report.toArray(),
//   };
// }

// const subThemes = ["button-theme"];

// function compareDeclarations(
//   modeName: string,
//   comparedTo: CssTree.CssNode,
//   selector: string,
//   list: CssTree.List<CssTree.CssNode>,
//   item: CssTree.ListItem<CssTree.CssNode>,
//   node: CssTree.Declaration
// ) {
//   const rule = CssTree.find(comparedTo, function (n) {
//     return n.type === "Rule" && CssTree.generate(n.prelude) === selector;
//   }) as CssTree.Rule | undefined;

//   if (!rule) {
//     console.warn(modeName, ` is missing the rule:`, selector);
//     list.insert(
//       {
//         data: {
//           type: "Comment",
//           value: ` Rule is missing from ${modeName} `,
//         },
//         prev: item.prev,
//         next: item,
//       },
//       item
//     );
//   } else {
//     const decNode = CssTree.find(rule, function (n) {
//       return (
//         n.type === node.type &&
//         n.property === node.property &&
//         n.important === node.important &&
//         CssTree.generate(this.rule.prelude) === selector
//       );
//     });
//     if (!decNode) {
//       console.warn(modeName, "is missing the declaration:", node.property, "on", selector);
//       list.insert(
//         list.createItem({
//           type: "Comment",
//           value: ` Declaration is missing from ${modeName} `,
//         }),
//         item.next
//       );
//     } else if (decNode.type === "Declaration" && CssTree.generate(decNode.value) !== CssTree.generate(node.value)) {
//       console.warn(modeName, "value is different for:", node.property, "on", selector);
//       console.warn(CssTree.generate(node.value), "=>", CssTree.generate(decNode.value));
//       list.insert(
//         list.createItem({
//           type: "Comment",
//           value: ` Value is different in ${modeName}: ${CssTree.generate(decNode.value)} `,
//         }),
//         item.next
//       );
//     }
//   }
// }

// export function transformNgMaterialTheme(transforms: CssTransformHandler[]) {
//   mkdirSync("./dist/theme", { recursive: true });
//   subThemes.forEach((subTheme) => {
//     const result = transformNgMaterialTemplateAndCompare(transforms, subTheme);
//     writeFileSync(Path.join("./dist/theme", `${subTheme}.css`), result.css, { encoding: "utf-8" });
//   });
// }
