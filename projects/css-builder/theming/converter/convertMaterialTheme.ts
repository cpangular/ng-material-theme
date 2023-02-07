import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { cssTransformers } from './transformers/transformers';


export function convertMaterialTheme() {
    mkdirSync('./dist', { recursive: true });

    const cssPath = '../NgMaterialApp/dist/ng-material-app/styles.css';

    let cssParts = readFileSync(cssPath, { encoding: 'utf-8' })
        .split(/(\/\*\!\*\*)|(\*\*\*\/\n)/g)
        .filter(i => !!i)
        .filter(i => !i.startsWith('/*!*'))
        .filter(i => !i.startsWith('***'))
        ;

    const coreCss = cssParts[0];
    writeFileSync('./dist/mat-core.css', coreCss, { encoding: 'utf-8' });


    let componentCss = cssParts[1];
    for (const transform of cssTransformers) {
        componentCss = transform(componentCss);
    }

    writeFileSync('./dist/mat-theme.css', componentCss, { encoding: 'utf-8' });
}