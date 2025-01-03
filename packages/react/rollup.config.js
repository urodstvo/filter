import _dts from 'rollup-plugin-dts';
import _esbuild from 'rollup-plugin-esbuild';
import { terser } from 'rollup-plugin-terser';

const name = require('./package.json').main.replace(/\.js$/, '');

const esbuild = _esbuild.default ?? _esbuild;
const dts = _dts.default ?? _dts;

/**
 * @param {import('rollup').RollupOptions} config
 * @returns {import('rollup').RollupOptions}
 */
const bundle = (config) => ({
    ...config,
    input: 'src/index.ts',
    external: ['react'],
});

export default [
    bundle({
        plugins: [esbuild()],
        output: [
            {
                file: `${name}.js`,
                format: 'cjs',
                sourcemap: true,
                exports: 'named',
                globals: { react: 'React' },
                plugins: [
                    terser({
                        output: { comments: false },
                        compress: {
                            drop_console: true,
                        },
                    }),
                ],
            },
            {
                file: `${name}.mjs`,
                format: 'esm',
                sourcemap: true,
                globals: { react: 'React' },
                exports: 'named',
            },
        ],
    }),
    bundle({
        plugins: [dts()],
        output: {
            dir: 'dist',
            preserveModules: true,
            format: 'cjs',
            sourcemap: true,
        },
    }),
];
