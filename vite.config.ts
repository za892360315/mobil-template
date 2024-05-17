import { defineConfig, loadEnv } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';
import type { UserConfig, ConfigEnv } from 'vite';
import { fileURLToPath } from 'url';
import AutoImport from 'unplugin-auto-import/vite';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import externalGlobals from 'rollup-plugin-external-globals';
import { VantResolver } from '@vant/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
// 不进行打包 已外链形式引入
const globals = externalGlobals({
    moment: 'moment',
    'video.js': 'videojs',
    jspdf: 'jspdf',
    xlsx: 'XLSX',
    echart: 'echart'
});
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
    // 获取当前工作目录
    const root = process.cwd();
    // 获取环境变量
    const env = loadEnv(mode, root);
    console.log(env);
    return {
        // 项目根目录
        root,
        // 项目部署的基础路径
        base: './',
        publicDir: fileURLToPath(new URL('./public', import.meta.url)), // 无需处理的静态资源位置
        assetsInclude: fileURLToPath(new URL('./src/assets', import.meta.url)), // 需要处理的静态资源位置
        css: {
            preprocessorOptions: {
                less: {
                    additionalData: `@import '@/assets/variable.less';`
                }
            }
        },
        plugins: [
            // Vue模板文件编译插件
            vue(),
            // jsx文件编译插件
            vueJsx(),
            // 开启mock服务器
            viteMockServe({
                // 如果接口为 /mock/xxx 以 mock 开头就会被拦截响应配置的内容
                mockPath: 'mock', // 数据模拟需要拦截的请求起始 URL
                enable: true // 本地环境是否开启 mock 功能
            }),
            // 打包压缩设置格式 brotli/ViteCompression二选一
            // brotli({}),
            // ViteCompression({
            //     threshold: 1024 * 20, // 超过20kb才进行压缩
            //     ext: '.gz', // 压缩后缀
            //     algorithm: 'gzip' // 压缩算法
            // }),
            // 开启ElementPlus自动引入CSS
            // ElementPlus({}),
            // 自动导入组件
            AutoImport({
                // 定义需要自动引入的框架
                imports: ['vue', 'vue-router', 'pinia'],
                // 处理eslint
                eslintrc: {
                    enabled: true
                },
                resolvers: [VantResolver()],
                dts: fileURLToPath(new URL('./types/auto-imports.d.ts', import.meta.url))
            }),
            // 自动注册组件
            Components({
                resolvers: [VantResolver()],
                dts: fileURLToPath(new URL('./types/components.d.ts', import.meta.url)),
                dirs: [fileURLToPath(new URL('./src/components/auto', import.meta.url))] //自动注册组件
            }),
            Icons({
                autoInstall: true
            })
        ],
        // 运行后本地预览的服务器
        server: {
            // 是否开启https
            https: false,
            // 指定服务器应该监听哪个 IP 地址。 如果将此设置为 0.0.0.0 或者 true 将监听所有地址，包括局域网和公网地址。
            host: true,
            // 开发环境预览服务器端口
            port: 9000,
            // 启动后是否自动打开浏览器
            open: false,
            // 是否开启CORS跨域
            cors: true,
            // 代理服务器
            // 帮助我们开发时解决跨域问题
            // 这里的意思是 以/api开头发送的请求都会被转发到 http://xxx:9000
            [env.VITE_APP_API_BASEURL]: {
                target: 'http://localhost:9001',
                // 改变 Host Header
                changeOrigin: true
                // 发起请求时将 '/api' 替换为 ''
                //rewrite: (path) => path.replace(/^\/api/, ""),
            },
            [env.VITE_APP_MOCK_BASEURL]: {
                target: 'http://localhost:9001',
                // 改变 Host Header
                changeOrigin: true
                // 发起请求时将 '/api' 替换为 ''
                //rewrite: (path) => path.replace(/^\/api/, ""),
            }
        },
        // 打包配置
        build: {
            // 关闭 sorcemap 报错不会映射到源码
            sourcemap: false,
            // 打包大小超出 400kb 提示警告
            chunkSizeWarningLimit: 400,
            rollupOptions: {
                // 打包入口文件 根目录下的 index.html
                // 也就是项目从哪个文件开始打包
                input: {
                    index: fileURLToPath(new URL('./index.html', import.meta.url))
                },
                external: ['moment', 'video.js', 'jspdf', 'xlsx', 'echart'], // 这些插件不进行打包
                plugins: [visualizer({ open: true }), globals],
                // 静态资源分类打包
                treeshake: {
                    preset: 'recommended'
                    // propertyReadSideEffects: true
                },
                output: {
                    experimentalMinChunkSize: 20 * 1024, //设置打包单文件大小大于20kb 再生成文件
                    manualChunks: (id: string) => {
                        // 极少数使用的插件，文件可以进行单独打包
                        // if (id.includes('html-canvans')) {
                        //     return 'html-canvans';
                        // }
                        // if (id.includes('src/views/about')) {
                        //     return 'about';
                        // }
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }
                        return 'index';
                    }
                    // chunkFileNames: 'static/js/[name]-[hash].js', // 代码分割后文件名
                    // entryFileNames: 'static/js/[name]-[hash:6].js', // 入口文件名
                    // assetFileNames: 'static/[ext]/[name]-[hash].[ext]' // 静态资源文件名
                }
            }
        },
        // 配置别名
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                '#': fileURLToPath(new URL('./types', import.meta.url))
            }
        }
    };
});
