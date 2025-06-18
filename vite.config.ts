import { defineConfig } from 'vite';
import { resolve } from 'path';
import generateBlockEntries from './vite.helpers';

const isProd = process.env.NODE_ENV === 'production';

// @ts-ignore:next line
export default defineConfig(() => {
    const blocksEntries = generateBlockEntries();
    const pathSrc = resolve(__dirname, "./src");

    return ({
        base: './',
        css: {
            devSourcemap: true,
        },
        resolve: {
            alias: {
                Blocks: resolve(__dirname, 'src/blocks'),
                Styles: resolve(__dirname, 'src/styles'),
            },
        },
        build: {
            target: "ES2022",
            sourcemap: true,
            minify: true,
            cssMinify: true,
            commonjsOptions: {
                include: ['node_modules/**'],
            },
            emptyOutDir: true,
            rollupOptions: {
                cache: false,
                preserveEntrySignatures: 'strict',
                input: {
                    main: './src/main.js',
                    styles: './src/styles/styles.css',
                    ...blocksEntries,
                },
                output: {
                    dir: 'dist',
                    assetFileNames: (chunkInfo) => {
                        // EDS will hide files starting with an underscore
                        const name = chunkInfo.name;

                        if (typeof name === 'string' && name.charAt(0) === "_") {
                            return 'common[name]/common[name][extname]';
                        }

                        return '[name]/[name][extname]';
                    },
                    chunkFileNames: 'chunks/[name]-[hash].js',
                    entryFileNames: '[name]/[name].js',
                },
                plugins: [isProd],
            },
        },
    });
});
