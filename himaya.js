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

    // خففنا الحساسية حتى ما ينضرب المستخدم الطبيعي
    if (end - start > 120) return poisonPage();

    const threshold = 160;
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      poisonPage();
    }
  };

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

      // ✅ السماح الصريح لـ Ctrl + C و Ctrl + V
      if (isMetaKey && (keyCode === 67 || keyCode === 86)) {
        return true;
      }

      const functionKeys = [123, 118]; // F12
      const dangerousChars = [85, 83, 80, 73, 74]; // U S P I J

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
    document.body.style.webkitUserSelect = "text";
    document.body.style.userSelect = "text";
  };

  window.onresize = checkSecurity;
})();