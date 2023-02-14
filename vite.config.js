import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { wrapperEnv,createProxy } from './build/utils';
import pkg from './package.json';
import { format } from 'date-fns';
const { dependencies, devDependencies, name, version } = pkg;
const __APP_INFO__ = {
  // APP 后台管理信息
  pkg: { dependencies, devDependencies, name, version },
  // 最后编译时间
  lastBuildTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const root = process.cwd();
  const env = loadEnv(mode, root, 'VITE_');
    // 读取并处理所有环境变量配置文件 .env
  const viteEnv = wrapperEnv(env);
  const { VITE_PUBLIC_PATH, VITE_DROP_CONSOLE, VITE_PORT, VITE_PROXY} = viteEnv;
  return {
    base: VITE_PUBLIC_PATH,
    root,
    plugins: [
      vue(),
      Components({ resolvers: [VantResolver()] })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      dedupe: ['vue'],
    },
    // 定义全局常量替换方式
    define: {
          // 在生产中 启用/禁用 intlify-devtools 和 vue-devtools 支持，默认值 false
          __INTLIFY_PROD_DEVTOOLS__: false,
          __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
    esbuild: {
      // 使用 esbuild 压缩 剔除 console.log
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : [],
      // minify: true, // minify: true, 等于 minify: 'esbuild',
    },
    build: {
      // 设置最终构建的浏览器兼容目标
      target: 'es2015',
      minify: 'esbuild',
      // 构建后是否生成 source map 文件(用于线上报错代码报错映射对应代码)
      sourcemap: false,
      cssTarget: 'chrome80',
      // 指定输出路径（相对于 项目根目录)
      outDir: 'dist/'+mode,
      // 只有 minify 为 terser 的时候, 本配置项才能起作用
      // terserOptions: {
      //   compress: {
      //     // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
      //     keep_infinity: true,
      //     // 打包是否自动删除 console
      //     drop_console: VITE_DROP_CONSOLE,
      //   },
      // },
      // 启用/禁用 gzip 压缩大小报告
      // 压缩大型输出文件可能会很慢，因此禁用该功能可能会提高大型项目的构建性能
      reportCompressedSize: true,
      // chunk 大小警告的限制（以 kbs 为单位）
      chunkSizeWarningLimit: 2000,
    },
    server: {
      host: true,
      port: VITE_PORT,
      proxy: createProxy(VITE_PROXY,['/api','/upload'])
    },
  }
});