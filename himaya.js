(function () {
  "use strict";

  document.documentElement.style.display = "none";

  const poisonPage = () => {
    document.body.innerHTML =
      '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:#ff0000;font-family:sans-serif;direction:rtl;"><h1>⚠️ تم قفل الوصول لحماية المحتوى</h1></div>';
    window.location.replace("about:blank");
  };

  const checkSecurity = () => {
    const start = performance.now();
    debugger;
    const end = performance.now();
    if (end - start > 50) return poisonPage();

    const threshold = 160;
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      poisonPage();
    }
  };

  // ✅ تم التعديل هنا: أزلنا "cut" و "paste" و "copy" من القائمة
  // تركنا "contextmenu" لمنع القائمة اليمنى و "dragstart" لمنع السحب فقط
  const preventAll = (e) => e.preventDefault();
  ["contextmenu", "dragstart"].forEach((event) => {
    document.addEventListener(event, preventAll);
  });

  window.addEventListener(
    "keydown",
    (e) => {
      const keyCode = e.keyCode || e.which;
      const isMetaKey = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      const functionKeys = [123, 118]; // F12
      // ✅ تم التعديل هنا: أزلنا keyCode 67 (حرف C) و 86 (حرف V) للسماح بالنسخ واللصق عبر الاختصارات
      const dangerousChars = [85, 83, 80, 73, 74]; 

      if (
        functionKeys.includes(keyCode) ||
        (isMetaKey && dangerousChars.includes(keyCode)) ||
        (isMetaKey && isShift && keyCode === 73)
      ) {
        e.preventDefault();
        poisonPage();
        return false;
      }
    },
    true
  );

  setInterval(checkSecurity, 500);

  if (typeof console !== "undefined") {
    ["log", "debug", "info", "warn", "error", "clear"].forEach(
      (method) => {
        console[method] = () => {};
      }
    );
    setInterval(() => console.clear(), 100);
  }

  if (window.self !== window.top)
    window.top.location = window.self.location;

  window.onload = () => {
    checkSecurity();
    document.documentElement.style.display = "block";
    // ضمان أن النص قابل للتحديد بالـ CSS
    document.body.style.webkitUserSelect = "text";
    document.body.style.userSelect = "text";
  };

  window.onresize = checkSecurity;
})();