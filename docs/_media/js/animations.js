/* 动态交互效果 - 为404NFD官网添加丝滑动画和活力感 */

// 页面加载动画
document.addEventListener('DOMContentLoaded', function() {
  // 延迟执行以确保页面已加载
  setTimeout(initAnimations, 100);
});

function initAnimations() {
  // 1. 页面切换动画 - 监听Docsify路由变化
  initPageTransitions();
  
  // 2. 滚动动画 - 元素进入视口时触发
  initScrollAnimations();
  
  // 3. 鼠标跟随效果
  initMouseEffects();
  
  // 4. 点击涟漪效果
  initRippleEffects();
  
  // 5. 动态背景效果（简约版）
  initDynamicBackground();
  
  // 6. 交互反馈增强
  initInteractiveFeedback();
}

// 页面切换动画
function initPageTransitions() {
  const app = document.getElementById('app');
  
  if (!app) return;
  
  // 监听Docsify的路由变化
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    triggerPageTransition();
  };
  
  window.addEventListener('popstate', triggerPageTransition);
  
  function triggerPageTransition() {
    app.style.opacity = '0';
    app.style.transform = 'translateY(20px)';
    app.style.transition = 'opacity 0.4s cubic-bezier(0.33, 1, 0.68, 1), transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)';
    
    setTimeout(() => {
      app.style.opacity = '1';
      app.style.transform = 'translateY(0)';
    }, 100);
  }
}

// 滚动动画
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // 观察所有具有动画潜力的元素
  document.querySelectorAll('.markdown-section h1, .markdown-section h2, .markdown-section h3, .team-card, .card, pre code, blockquote').forEach(el => {
    el.classList.add('scroll-animate');
    observer.observe(el);
  });
  
  // 添加对应的CSS类
  const style = document.createElement('style');
  style.textContent = `
    .scroll-animate {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s cubic-bezier(0.33, 1, 0.68, 1), transform 0.6s cubic-bezier(0.33, 1, 0.68, 1);
    }
    
    .scroll-animate.animated {
      opacity: 1;
      transform: translateY(0);
    }
    
    .scroll-animate:nth-child(odd) {
      transition-delay: 0.1s;
    }
    
    .scroll-animate:nth-child(even) {
      transition-delay: 0.2s;
    }
  `;
  document.head.appendChild(style);
}

// 鼠标跟随效果
function initMouseEffects() {
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  document.body.appendChild(cursor);
  
  const cursorStyle = document.createElement('style');
  cursorStyle.textContent = `
    #custom-cursor {
      position: fixed;
      width: 20px;
      height: 20px;
      border: 2px solid #64b5f6;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: width 0.2s, height 0.2s, background-color 0.2s, border-color 0.2s;
      transform: translate(-50%, -50%);
      mix-blend-mode: difference;
    }
    
    #custom-cursor.hover {
      width: 40px;
      height: 40px;
      background-color: rgba(100, 181, 246, 0.1);
      border-color: #42a5f5;
    }
    
    #custom-cursor.click {
      width: 30px;
      height: 30px;
      background-color: rgba(100, 181, 246, 0.2);
    }
    
    body {
      cursor: none;
    }
    
    a, button, .team-card, input {
      cursor: none !important;
    }
  `;
  document.head.appendChild(cursorStyle);
  
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // 平滑跟随动画
  function animateCursor() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    
    cursorX += dx * 0.15;
    cursorY += dy * 0.15;
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
  
  // 悬停效果
  const hoverElements = document.querySelectorAll('a, button, .team-card, input, .card');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
  
  // 点击效果
  document.addEventListener('mousedown', () => cursor.classList.add('click'));
  document.addEventListener('mouseup', () => cursor.classList.remove('click'));
}

// 点击涟漪效果
function initRippleEffects() {
  document.addEventListener('click', function(e) {
    const target = e.target;
    
    // 只在按钮和卡片上添加涟漪效果
    if (target.matches('button, a.btn, .team-card, .card, section.cover .cover-main > p:last-child a')) {
      createRipple(e, target);
    }
  });
  
  function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple-animation 0.6s linear';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '100';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    
    element.appendChild(ripple);
    
    // 添加动画样式
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    setTimeout(() => ripple.remove(), 600);
  }
}

// 动态背景效果（简约版）
function initDynamicBackground() {
  // 只在封面页添加动态背景
  const coverSection = document.querySelector('section.cover');
  if (!coverSection) return;
  
  const canvas = document.createElement('canvas');
  canvas.id = 'dynamic-bg';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.opacity = '0.1';
  canvas.style.pointerEvents = 'none';
  
  coverSection.style.position = 'relative';
  coverSection.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  let width = canvas.width = coverSection.offsetWidth;
  let height = canvas.height = coverSection.offsetHeight;
  
  // 简单的粒子系统
  const particles = [];
  const particleCount = 30;
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 1 - 0.5;
      this.speedY = Math.random() * 1 - 0.5;
      this.color = '#64b5f6';
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      if (this.x > width) this.x = 0;
      if (this.x < 0) this.x = width;
      if (this.y > height) this.y = 0;
      if (this.y < 0) this.y = height;
    }
    
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // 初始化粒子
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    
    for (let particle of particles) {
      particle.update();
      particle.draw();
    }
    
    // 绘制粒子之间的连线
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(100, 181, 246, ${0.2 * (1 - distance / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(animateParticles);
  }
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    width = canvas.width = coverSection.offsetWidth;
    height = canvas.height = coverSection.offsetHeight;
  });
  
  animateParticles();
}

// 交互反馈增强
function initInteractiveFeedback() {
  // 为所有交互元素添加声音反馈（视觉反馈已通过CSS实现）
  const interactiveElements = document.querySelectorAll('a, button, input, .team-card, .card');
  
  interactiveElements.forEach(el => {
    // 添加键盘导航支持
    el.addEventListener('focus', () => {
      el.classList.add('keyboard-focus');
    });
    
    el.addEventListener('blur', () => {
      el.classList.remove('keyboard-focus');
    });
  });
  
  // 添加强制重排以优化动画性能
  document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (app) {
      app.style.willChange = 'transform, opacity';
    }
  });
}

// 工具函数：防抖
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}