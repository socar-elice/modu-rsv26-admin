/**
 * nav-menu.js
 * 공통 헤더 + 사이드바(LNB) — 모든 페이지에서 공유
 * 사용법: <script src="nav-menu.js"></script>  →  자동 렌더링 (DOMContentLoaded)
 *
 * 현재 페이지 URL을 기준으로 active 메뉴를 자동 감지합니다.
 * 메뉴 구조나 이름을 변경하면 모든 페이지에 즉시 반영됩니다.
 */

(function () {
  'use strict';

  // ============================================================
  // 메뉴 데이터 — 이곳만 수정하면 전체 페이지에 반영됩니다
  // ============================================================
  var NAV_MENU_DATA = [
    {
      id: 'sales', label: '판매관리', badge: '변경',
      children: [
        { label: '대쉬보드', href: '#' },
        { label: '결제현황 관리', href: '#' },
        { label: '결제관리(캘린더)', href: '360_결제관리_캘린더뷰.html' , badge: '변경'},
        { label: '주차관리', href: '340_주차관리.html', badge: '변경' },
        { label: '주차관리(캘린더)', href: '350_주차관리_캘린더뷰.html', badge: '변경' },
        { label: '맵뷰', href: '#' },
        { label: '환불관리', href: '#' },
      ],
    },
    {
      id: 'settle', label: '정산 관리',
      children: [
        { label: '계좌환불', href: '#' },
        { label: '마감처리', href: '#' },
        { label: '정산내역서', href: '#' },
      ],
    },
    {
      id: 'erp', label: 'ERP',
      children: [
        { label: '매출내역 전송', href: '#' },
        { label: '정산내역서 전송', href: '#' },
      ],
    },
    {
      id: 'info', label: '정보 관리',
      children: [
        { label: '일반주차장 관리', href: '#' },
        { label: '수정요청', href: '#' },
        { label: '등록요청', href: '#' },
      ],
    },
    {
      id: 'share', label: '공유 관리',
      children: [
        { label: '공유주차장', href: '#' },
        { label: 'IoT 관리', href: '#' },
        { label: '공유시간정책', href: '#' },
      ],
    },
    {
      id: 'partner', label: '제휴 관리', badge: 'MVP',
      children: [
        { label: '제휴주차장 관리', href: '#' },
        { label: '제휴상품생성하기', href: '300_주차상품판매정책설정.html', indent: true, badge: 'MVP' },
        { label: '제휴상품상세', href: '320_제휴상품상세.html', indent: true, badge: 'MVP' },
        { label: '판매정책 캘린더뷰', href: '325_판매정책_캘린더뷰.html', indent: true, badge: '변경' },
        { label: '월주차 현황', href: '#' },
        { label: '월주차 신청', href: '#' },
        { label: '거래처(BP)', href: '#' },
        { label: '정산대상(STG)', href: '#' },
        { label: '제휴신청목록', href: '#' },
        { label: '제휴주차상품 예약관리', href: '#' },
        { label: '제휴계약관리', href: '#' },
      ],
    },
    {
      id: 'autopay', label: '자동결제 관리',
      children: [
        { label: '자동결제 관리', href: '#' },
      ],
    },
    {
      id: 'charger', label: '충전소 관리',
      children: [
        { label: 'EV 충전소', href: '#' },
      ],
    },
    {
      id: 'coupon', label: '포인트/쿠폰/상품권 관리',
      children: [
        { label: '포인트 관리', href: '#' },
        { label: '쿠폰 관리', href: '#' },
        { label: '상품권 관리', href: '#' },
      ],
    },
    {
      id: 'partners', label: '파트너 관리',
      children: [
        { label: '파트너 관리', href: '#' },
        { label: '파트너 주차장 변경요청', href: 'I050-parking-change-request.html' },
        { label: '입출차 확인', href: 'P120-parking-log.html' },
      ],
    },
    {
      id: 'service', label: '서비스 관리',
      children: [
        { label: '메시지', href: '#' },
        { label: '공지사항', href: '#' },
        { label: '배너', href: '#' },
        { label: '회원관리', href: '#' },
      ],
    },
    {
      id: 'admin', label: '어드민 관리',
      children: [
        { label: '어드민관리', href: '#' },
        { label: '권한관리', href: '#' },
        { label: '패스워드변경', href: '#' },
      ],
    },
  ];

  // 외부에서 접근 가능하도록 (React 페이지 등에서 필요 시)
  window.NAV_MENU_DATA = NAV_MENU_DATA;

  // ============================================================
  // 현재 페이지 파일명 추출
  // ============================================================
  function getCurrentPage() {
    var path = window.location.pathname;
    var filename = path.substring(path.lastIndexOf('/') + 1);
    return decodeURIComponent(filename);
  }

  // ============================================================
  // 헤더 HTML 생성
  // ============================================================
  function buildHeaderHTML() {
    return ''
      + '<header class="header">'
      + '  <button class="header__menu-toggle" id="menuToggle">'
      + '    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
      + '  </button>'
      + '  <div class="header__logo">'
      + '    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">'
      + '      <rect x="2" y="2" width="28" height="28" rx="8" fill="#3b82f6"/>'
      + '      <text x="16" y="22" text-anchor="middle" font-size="18" font-weight="700" fill="#fff" font-family="sans-serif">P</text>'
      + '    </svg>'
      + '    모두의주차장 관리자'
      + '    <span class="header__env">dev</span>'
      + '  </div>'
      + '  <div class="header__right">'
      + '    <span class="header__user">elice님</span>'
      + '    <a href="javascript:void(0)" class="header__link">내정보</a>'
      + '    <a href="javascript:void(0)" class="header__link">로그아웃</a>'
      + '  </div>'
      + '</header>';
  }

  // ============================================================
  // LNB HTML 생성
  // ============================================================
  function buildLNBHTML(currentPage) {
    var html = '<div class="lnb-overlay" id="lnbOverlay"></div>';
    html += '<nav class="lnb" id="lnb">';

    for (var i = 0; i < NAV_MENU_DATA.length; i++) {
      var group = NAV_MENU_DATA[i];

      // 현재 페이지가 이 그룹에 속하는지 확인
      var groupHasActive = false;
      for (var j = 0; j < group.children.length; j++) {
        if (group.children[j].href === currentPage) {
          groupHasActive = true;
          break;
        }
      }

      var openClass = groupHasActive ? ' open' : '';

      html += '<div class="lnb__group">';
      var groupBadgeCls = 'lnb__badge' + (group.badge === '변경' ? ' lnb__badge--low' : '');
      var groupBadgeHTML = group.badge ? ' <span class="' + groupBadgeCls + '">' + group.badge + '</span>' : '';
      html += '  <div class="lnb__group-label' + openClass + '" onclick="window.__toggleLnbGroup(this)">';
      html += '    ' + group.label + groupBadgeHTML + ' <span class="arrow">▼</span>';
      html += '  </div>';
      html += '  <div class="lnb__group-children' + openClass + '">';

      for (var k = 0; k < group.children.length; k++) {
        var item = group.children[k];
        var isActive = (item.href === currentPage);
        var activeClass = isActive ? ' lnb__item--active' : '';
        var indentStyle = item.indent ? ' style="padding-left:48px;"' : '';

        var badgeCls = 'lnb__badge' + (item.badge === '변경' ? ' lnb__badge--low' : '');
        var badgeHTML = item.badge ? ' <span class="' + badgeCls + '">' + item.badge + '</span>' : '';
        html += '<a class="lnb__item' + activeClass + '" href="' + item.href + '"' + indentStyle + '>' + item.label + badgeHTML + '</a>';
      }

      html += '  </div>';
      html += '</div>';
    }

    html += '</nav>';
    return html;
  }

  // ============================================================
  // LNB 그룹 토글
  // ============================================================
  window.__toggleLnbGroup = function (label) {
    label.classList.toggle('open');
    var children = label.nextElementSibling;
    if (children) {
      children.classList.toggle('open');
    }
  };

  // ============================================================
  // 모바일 토글 이벤트 바인딩
  // ============================================================
  function bindToggleEvents() {
    var menuToggle = document.getElementById('menuToggle');
    var lnb = document.getElementById('lnb');
    var lnbOverlay = document.getElementById('lnbOverlay');

    if (menuToggle && lnb) {
      menuToggle.addEventListener('click', function () {
        lnb.classList.toggle('open');
        if (lnbOverlay) lnbOverlay.classList.toggle('show');
      });
    }
    if (lnbOverlay && lnb) {
      lnbOverlay.addEventListener('click', function () {
        lnb.classList.remove('open');
        lnbOverlay.classList.remove('show');
      });
    }
  }

  // ============================================================
  // 초기화 — DOMContentLoaded 시 자동 실행
  // ============================================================
  function initNav() {
    var currentPage = getCurrentPage();
    var headerHTML = buildHeaderHTML();
    var lnbHTML = buildLNBHTML(currentPage);

    // body 맨 앞에 삽입
    document.body.insertAdjacentHTML('afterbegin', lnbHTML);
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    bindToggleEvents();
  }

  // DOM 준비되면 자동 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
