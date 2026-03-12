document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const backToTop = document.getElementById("backToTop");
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');

  // 移动端菜单
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen);
      navToggle.setAttribute("aria-label", isOpen ? "关闭菜单" : "打开菜单");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "打开菜单");
      });
    });
  }

  // 平滑滚动 + 导航高亮
  const sections = document.querySelectorAll("section[id]");

  function scrollToSection(e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const target = document.querySelector(targetId);
    if (target && header) {
      const top = target.getBoundingClientRect().top + window.pageYOffset - header.offsetHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  function updateActiveNav() {
    const headerH = header ? header.offsetHeight : 0;
    let current = "";

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= headerH + 100) {
        current = section.getAttribute("id") || "";
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("active", href === `#${current}`);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", scrollToSection);
  });

  window.addEventListener("scroll", updateActiveNav);
  updateActiveNav();

  // 头部滚动阴影
  function updateHeaderShadow() {
    if (header) {
      header.classList.toggle("scrolled", window.pageYOffset > 20);
    }
  }
  window.addEventListener("scroll", updateHeaderShadow);
  updateHeaderShadow();

  // 数字动画（Hero 统计）
  function animateValue(el, target, suffix) {
    const duration = 1200;
    const start = 0;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeOut);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function runStatsAnimation() {
    document.querySelectorAll(".stat-number").forEach((el) => {
      const target = parseInt(el.getAttribute("data-target"), 10) || 0;
      animateValue(el, target);
    });
  }

  // 滚动入场动画
  const animateSelectors = ".feature-card, .mission-card, .team-card, .service-card";

  function runScrollAnimation() {
    document.querySelectorAll(animateSelectors).forEach((el) => {
      const rect = el.getBoundingClientRect();
      const visible = rect.top < window.innerHeight - 120;
      if (visible) el.classList.add("animate");
    });
  }

  window.addEventListener("scroll", runScrollAnimation);

  // 页面加载
  window.addEventListener("load", function () {
    runStatsAnimation();
    runScrollAnimation();
    setTimeout(() => document.body.classList.add("loaded"), 50);
  });

  // 返回顶部
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    function toggleBackToTop() {
      backToTop.classList.toggle("visible", window.pageYOffset > 400);
    }
    window.addEventListener("scroll", toggleBackToTop);
  }
});
