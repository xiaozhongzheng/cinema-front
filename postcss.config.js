module.exports = {
  plugins: { // 大写PX可以忽略响应式
    'postcss-pxtorem': {
      rootValue: 10,
      propList: ['*'],               // 需要转换的属性，*表示全部
     selectorBlackList: [
        // 忽略 UI 框架
        '.el-',        // Element Plus
        // 忽略特定功能类
        '.ignore-',
        '.no-rem',
      ],
      minPixelValue: 12,               // 小于12px不转换
      mediaQuery: false,                // 是否转换媒体查询中的px

    }
  }
}
