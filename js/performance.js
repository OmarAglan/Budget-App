// Performance Monitoring and Optimization
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      interactionDelay: 0,
      memoryUsage: 0
    };
    
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      this.metrics.loadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
      
      console.log(`Page load time: ${this.metrics.loadTime}ms`);
      
      // Monitor memory usage if available
      if (performance.memory) {
        this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        console.log(`Memory usage: ${this.metrics.memoryUsage.toFixed(2)}MB`);
      }
    });

    // Monitor rendering performance
    this.observeRenderPerformance();
    
    // Monitor user interactions
    this.monitorInteractions();
  }

  observeRenderPerformance() {
    // Use Intersection Observer for efficient DOM monitoring
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observe all cards for animation
    document.addEventListener('DOMContentLoaded', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => observer.observe(card));
    });
  }

  monitorInteractions() {
    // Monitor button click responsiveness
    document.addEventListener('click', (e) => {
      if (e.target.matches('button, .btn')) {
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
          const endTime = performance.now();
          const delay = endTime - startTime;
          
          if (delay > 100) {
            console.warn(`Slow interaction detected: ${delay}ms`);
          }
        });
      }
    });
  }

  // Optimize large data operations
  optimizeDataOperations() {
    // Use requestIdleCallback for non-critical operations
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        this.cleanupOldData();
        this.optimizeLocalStorage();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.cleanupOldData();
        this.optimizeLocalStorage();
      }, 1000);
    }
  }

  cleanupOldData() {
    // Remove expenses older than 2 years to keep performance optimal
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const cleanedExpenses = expenses.filter(expense => 
      new Date(expense.date) > twoYearsAgo
    );
    
    if (cleanedExpenses.length < expenses.length) {
      localStorage.setItem('expenses', JSON.stringify(cleanedExpenses));
      console.log(`Cleaned up ${expenses.length - cleanedExpenses.length} old expenses`);
    }
  }

  optimizeLocalStorage() {
    // Check localStorage usage and warn if approaching limits
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    
    const sizeMB = totalSize / 1024 / 1024;
    console.log(`LocalStorage usage: ${sizeMB.toFixed(2)}MB`);
    
    // Warn if approaching 5MB limit (most browsers allow 5-10MB)
    if (sizeMB > 4) {
      console.warn('LocalStorage approaching limit. Consider exporting old data.');
    }
  }

  // Lazy load charts for better initial page load
  lazyLoadCharts() {
    const chartContainers = document.querySelectorAll('canvas[id*="chart"]');
    
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const chartId = entry.target.id;
          this.initializeChart(chartId);
          chartObserver.unobserve(entry.target);
        }
      });
    });

    chartContainers.forEach(container => {
      chartObserver.observe(container);
    });
  }

  initializeChart(chartId) {
    switch (chartId) {
      case 'expense-chart':
        if (typeof initializeExpenseChart === 'function') {
          initializeExpenseChart();
        }
        break;
      case 'expense-trend-chart':
        if (typeof initializeTrendChart === 'function') {
          initializeTrendChart();
        }
        break;
    }
  }

  // Report performance metrics
  getPerformanceReport() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Add CSS for animation
const animationStyles = `
  .animate-in {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);