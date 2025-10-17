import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')  // 配置别名路径
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'] // 文件扩展名解析顺序
    },
    server: {
        port: 8088,
        host: true,
        watch: {
            // use polling to ensure file change events are detected in WSL/remote mounts
            usePolling: true,
            interval: 100
        },
        hmr: {
            protocol: 'ws',
            // explicit host so HMR websocket connects correctly from Windows browser to WSL server
            host: 'localhost'
        },
        proxy: {
            '/api': {
                target: 'http://106.52.252.158:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')  // 修正：参数名避免使用单个字母
            }
        }
    }
})