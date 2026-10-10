/* 株式会社ZUDIA コーポレートサイト js/main.js
   本文は HTML にすべて書いてある（AIや検索エンジンが読めるように）。ここは動きと絞り込みだけを担う。
   JS が動かなくても全文が見える：隠す CSS は html.js が付いたときだけ効く。 */
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  // ヘッダー：スクロールしたら細くして下線を出す
  var header = document.querySelector('.site-header');
  var onScroll = function () { header && header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // スマホのメニュー：リンクを押したら閉じる
  document.querySelectorAll('.menu-list a').forEach(function (a) {
    a.addEventListener('click', function () { a.closest('details').removeAttribute('open'); });
  });

  // スクロール表示：画面に入ったら .is-in を付ける。並びの要素は少しずつ遅らせる
  var targets = document.querySelectorAll('.reveal, .step');
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el, i) { el.style.setProperty('--d', (i * 0.08) + 's'); });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('is-in');
        io.unobserve(el);
        // 出し終えたら reveal を外し、カード本来の hover の動き（遅延なし）に戻す
        if (el.classList.contains('reveal')) {
          var delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
          setTimeout(function () { el.classList.remove('reveal'); el.style.removeProperty('--d'); }, 900 + delay * 1000);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  }

  // 数字のカウントアップ：HTML には最終値を書いておき（AIや検索エンジンにはそのまま読める）、表示時だけ 0 から数える
  var counters = document.querySelectorAll('[data-count]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var countUp = function (el) {
      var end = parseFloat(el.textContent.replace(/,/g, ''));
      if (isNaN(end)) return;
      var dec = (el.textContent.split('.')[1] || '').length, t0 = null, dur = 1400;
      var step = function (t) {
        if (!t0) t0 = t;
        var k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (end * e).toFixed(dec);
        if (k < 1) requestAnimationFrame(step); else el.textContent = end.toFixed(dec);
      };
      requestAnimationFrame(step);
    };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // 実績の絞り込み：ボタンの data-filter と各 .work の data-cat（空白区切り）を照合する
  var filters = document.querySelector('.filters');
  if (filters) {
    var works = Array.prototype.slice.call(document.querySelectorAll('.works .work'));
    var status = document.getElementById('works-status');
    var buttons = filters.querySelectorAll('button[data-filter]');
    // 件数を数えてボタンに出す（実績を足しても数え直し不要）
    buttons.forEach(function (b) {
      var f = b.dataset.filter;
      var n = f === 'all' ? works.length : works.filter(function (w) { return (' ' + w.dataset.cat + ' ').indexOf(' ' + f + ' ') > -1; }).length;
      var c = document.createElement('span'); c.className = 'count'; c.textContent = n; b.appendChild(c);
      if (n === 0) b.hidden = true;
    });
    var apply = function (f) {
      var shown = 0;
      works.forEach(function (w) {
        var hit = f === 'all' || (' ' + w.dataset.cat + ' ').indexOf(' ' + f + ' ') > -1;
        w.hidden = !hit;
        if (hit) { shown++; w.classList.add('is-in'); }
      });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === f)); });
      if (status) status.textContent = shown + '件を表示中';
    };
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filter]');
      if (!b) return;
      apply(b.dataset.filter);
      try { history.replaceState(null, '', b.dataset.filter === 'all' ? '#works' : '#works-' + b.dataset.filter); } catch (err) {}
    });
    // URL の #works-aio などで開いたら、その分類で絞り込んだ状態にする
    var m = location.hash.match(/^#works-(\w+)/);
    if (m && filters.querySelector('[data-filter="' + m[1] + '"]')) {
      apply(m[1]);
      var sec = document.getElementById('works');
      sec && sec.scrollIntoView();
    }
  }

  // 年号
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
