/* ============================================================
   shared.js — 300/320 공통 유틸리티
   ============================================================ */
(function () {
  'use strict';

  var Shared = {};

  /* ── Footer: 최종업데이트 날짜 표시 ── */
  Shared.initFooter = function () {
    var footer = document.getElementById('appFooter');
    if (!footer) return;
    var lastMod = new Date(document.lastModified);
    var yyyy = lastMod.getFullYear();
    var MM = String(lastMod.getMonth() + 1).padStart(2, '0');
    var dd = String(lastMod.getDate()).padStart(2, '0');
    var hh = String(lastMod.getHours()).padStart(2, '0');
    var mm = String(lastMod.getMinutes()).padStart(2, '0');
    footer.textContent = '\u00A9 2026. \uC8FC\uCC28\uAD8C\uC608\uB9E4\uC11C\uBE44\uC2A4. \uCD5C\uC885\uC5C5\uB370\uC774\uD2B8 : ' + yyyy + '.' + MM + '.' + dd + ' ' + hh + ':' + mm;
  };

  /* ── Toast 알림 ── */
  window.showToast = function (message, type) {
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'success');
    toast.innerHTML = '<span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('toast--out');
      setTimeout(function () { toast.remove(); }, 260);
    }, 3000);
  };

  /* ── 정산금액 계산 ── */
  Shared.calcSettlement = function (price, rateInputId) {
    var el = document.getElementById(rateInputId || 'settlementRate');
    var rate = el ? (parseFloat(el.value) || 0) : 0;
    return Math.round(price * rate / 100);
  };

  /* ── 텍스트 글자수 카운터 ── */
  Shared.bindCounter = function (textareaId, counterId) {
    var ta = document.getElementById(textareaId);
    var ct = document.getElementById(counterId);
    if (!ta || !ct) return;
    ta.addEventListener('input', function () { ct.textContent = ta.value.length; });
  };

  /* ── 예매 설정 라디오 토글 ── */
  Shared.initReservationTypeToggle = function () {
    var radios = document.querySelectorAll('input[name="reservationType"]');
    var $saleStart = document.getElementById('rowResvSaleStartTime');
    var $saleEnd = document.getElementById('rowResvSaleEndTime');
    var $purchaseStart = document.getElementById('rowPurchaseStart');
    var $purchaseEnd = document.getElementById('rowPurchaseEnd');

    if (!radios.length || !$purchaseStart) return;

    function toggleReservationRows() {
      var checked = document.querySelector('input[name="reservationType"]:checked');
      if (!checked) return;
      var isAvailable = (checked.value === 'available');
      if ($saleStart) $saleStart.style.display = isAvailable ? 'none' : '';
      if ($saleEnd) $saleEnd.style.display = isAvailable ? 'none' : '';
      if ($purchaseStart) $purchaseStart.style.display = isAvailable ? '' : 'none';
      if ($purchaseEnd) $purchaseEnd.style.display = isAvailable ? '' : 'none';
    }

    radios.forEach(function (r) {
      r.addEventListener('change', toggleReservationRows);
    });

    toggleReservationRows();
  };

  /* ── DOMContentLoaded에서 자동 초기화 ── */
  document.addEventListener('DOMContentLoaded', function () {
    Shared.initFooter();
  });

  window.Shared = Shared;
})();
