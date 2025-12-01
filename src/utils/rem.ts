(() => {
  document.addEventListener("DOMContentLoaded", () => {
     // 关键新增：判断当前路径是否包含 "admin"（忽略大小写）
    const currentPath = window.location.pathname;
    const isAdminPath = currentPath.toLowerCase().includes("/admin/"); // 匹配 /admin/ 路径（避免误匹配含admin的其他单词）
    const docEl = document.documentElement;
    
    if (isAdminPath) {
      docEl.style.fontSize = "10px";
      return;
    }

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

    };

    // 初始加载与窗口缩放时执行
    resizeFn();
    window.addEventListener("resize", resizeFn);
  });
})();