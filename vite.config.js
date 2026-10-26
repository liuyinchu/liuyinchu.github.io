import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'
import { postItPlugin } from './scripts/vite-post-it.mjs'

export default defineConfig({
  base: '/', // ✅ 根目录仓库为 /
  plugins: [
    vue(),
    postItPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, 'dist/index.html'),
          dest: '',            // 放在 dist 根目录
          rename: '404.html',  // 重命名为 404.html
        },
      ],
      hook: 'writeBundle',     // ⬅️ 确保在 build 后复制
    }),
  ],
})