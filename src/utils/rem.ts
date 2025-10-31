(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const docEl = document.documentElement;
    const designWidth = 1280; // 设计稿宽度
    // 字体基准值范围：最小值0.8（对应html字体8px）、最大值1.2（对应html字体12px）
    const minBaseSize = 0.8; 
    const maxBaseSize = 1.2;

    const resizeFn = () => {
      const currentWidth = docEl.clientWidth;
      let baseSize = currentWidth / designWidth;

      // 2. 限制基准值在 [minBaseSize, maxBaseSize] 范围内
      const finalBaseSize = Math.max(minBaseSize, Math.min(baseSize, maxBaseSize));
      // 计算最终html字体大小（基准值×10）
      const htmlFontSize = finalBaseSize * 10;
      docEl.style.fontSize = htmlFontSize + "px";

      // 调试用：查看关键参数（可删除）
      console.log(
        "当前宽度:", currentWidth,
        "基准值:", finalBaseSize,
        "HTML字体大小:", htmlFontSize + "px"
      );
    };

    // 初始加载与窗口缩放时执行
    resizeFn();
    window.addEventListener("resize", resizeFn);
  });
})();