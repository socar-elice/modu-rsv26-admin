/**
 * mockup-info.js
 * 플로팅 (?) 버튼 + 우측 사이드 패널 — 목업 변경사항/유저스토리/지라 정보 표시
 * 사용법: <script src="mockup-info.js"></script>  →  자동 렌더링 (DOMContentLoaded)
 *
 * PAGE_INFO 데이터만 수정하면 각 페이지별 설명이 자동 반영됩니다.
 */
(function () {
  'use strict';

  // ============================================================
  // 페이지별 정보 데이터 — 이곳만 수정하면 전체 반영
  // ============================================================
  var PAGE_INFO = {
    '300_주차상품판매정책설정.html': {
      title: '주차상품 판매정책 설정',
      description: '제휴주차상품의 판매정책을 생성하는 화면입니다.',
      changes: [
       
        '요일별/일괄 가격설정 모드 전환 기능',
        'D- 기준 / 날짜시간 모드 전환 (구매가능 시작일)',
        '예매 가능 마감 설정 항목 추가',
        '고객 추가 정보 입력 항목 섹션 추가',
        '주차권유형 시간권(입차기준)추가',
      ],
      userStories: [
        { id: 'US-000', title: '내용을 곧 업로드할 예정입니다.' },
      ],
      policies: [
        '내용을 곧 업로드할 예정입니다.',
      ],
      jiraTickets: [
        { key: 'MODU-000', title: '내용을 곧 업로드할 예정입니다.', url: '' },
      ],
    },
    '320_제휴상품상세.html': {
      title: '제휴상품 상세',
      description: '생성된 제휴상품의 상세 정보를 조회하고 수정할 수 있는 화면입니다.',
      changes: [
        '이벤트 스케줄 조회 및 관리 섹션 추가'
      ],
      policies: [
        '내용을 곧 업로드할 예정입니다.',
      ],
      userStories: [
        { id: 'US-000', title: '내용을 곧 업로드할 예정입니다.' },
      ],
      jiraTickets: [
        { key: 'MODU-000', title: '내용을 곧 업로드할 예정입니다.', url: '' },
      ],
    },
    '340_주차관리.html': {
      title: '주차관리 (리스트뷰)',
      description: '결제주차권 목록을 조회하고 상세 패널에서 관리하는 화면입니다. 신규화면입니다.',
      changes: [
        '리스트를 선택하면 상세 주차내역을 확인할 수 있습니다'
      ],
      policies: [
        '내용을 곧 업로드할 예정입니다.',
      ],
      userStories: [
        { id: 'US-000', title: '내용을 곧 업로드할 예정입니다.' },
      ],
      jiraTickets: [
        { key: 'MODU-000', title: '내용을 곧 업로드할 예정입니다.', url: '' },
      ],
    },
    '350_주차관리_캘린더뷰.html': {
      title: '주차관리 (캘린더뷰)',
      description: '결제주차권을 캘린더(월간수요) 형태로 조회하는 화면입니다.',
      changes: [
        '캘린더뷰 월간 수요 시각화',
      ],
      policies: [
        '내용을 곧 업로드할 예정입니다.',
      ],
      userStories: [
        { id: 'US-000', title: '내용을 곧 업로드할 예정입니다.' },
      ],
      jiraTickets: [
        { key: 'MODU-000', title: '내용을 곧 업로드할 예정입니다.', url: '' },
      ],
    },
    '360_결제관리_캘린더뷰.html': {
      title: '결제관리 (캘린더뷰)',
      description: '결제 현황을 캘린더(월간) 형태로 조회하는 화면입니다.',
      changes: [
        '결제관리 캘린더뷰 신규 페이지',
        '상세패널 공통 컴포넌트 분리',
      ],
      policies: [
        '내용을 곧 업로드할 예정입니다.',
      ],
      userStories: [
        { id: 'US-000', title: '내용을 곧 업로드할 예정입니다.' },
      ],
      jiraTickets: [
        { key: 'MODU-000', title: '내용을 곧 업로드할 예정입니다.', url: '' },
      ],
    },
    '990_결제주차권상세.html': {
      title: '결제주차권 상세',
      description: '개별 결제주차권의 상세 정보를 조회하는 화면입니다.',
      changes: [
        '결제주차권 상세 패널 UI 개선',
      ],
      policies: [
        '내용을 곧 업로드할 예정입니다.',
      ],
      userStories: [
        { id: 'US-000', title: '내용을 곧 업로드할 예정입니다.' },
      ],
      jiraTickets: [
        { key: 'MODU-000', title: '내용을 곧 업로드할 예정입니다.', url: '' },
      ],
    },
  };

  // ============================================================
  // 현재 페이지 파일명 추출
  // ============================================================
  function getCurrentPage() {
    var path = window.location.pathname;
    var filename = path.substring(path.lastIndexOf('/') + 1);
    return decodeURIComponent(filename);
  }

  // ============================================================
  // CSS 삽입
  // ============================================================
  function injectStyles() {
    var css = ''
      /* 플로팅 버튼 */
      + '.mockup-info-fab {'
      + '  position: fixed; bottom: 28px; right: 28px; z-index: 10000;'
      + '  width: 48px; height: 48px; border-radius: 50%;'
      + '  background: #3b82f6; color: #fff; border: none; cursor: pointer;'
      + '  font-size: 22px; font-weight: 700; line-height: 48px; text-align: center;'
      + '  box-shadow: 0 4px 16px rgba(59,130,246,0.35);'
      + '  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;'
      + '}'
      + '.mockup-info-fab:hover {'
      + '  transform: scale(1.08);'
      + '  box-shadow: 0 6px 24px rgba(59,130,246,0.45);'
      + '  background: #2563eb;'
      + '}'
      + '.mockup-info-fab--active {'
      + '  background: #64748b;'
      + '}'
      + '.mockup-info-fab--active:hover { background: #475569; }'

      /* 오버레이 */
      + '.mockup-info-overlay {'
      + '  position: fixed; top: 0; left: 0; width: 100%; height: 100%;'
      + '  background: rgba(0,0,0,0.15); z-index: 10001;'
      + '  opacity: 0; pointer-events: none;'
      + '  transition: opacity 0.25s ease;'
      + '}'
      + '.mockup-info-overlay--open {'
      + '  opacity: 1; pointer-events: auto;'
      + '}'

      /* 사이드 패널 */
      + '.mockup-info-panel {'
      + '  position: fixed; top: 0; right: 0; z-index: 10002;'
      + '  width: 380px; max-width: 90vw; height: 100vh;'
      + '  background: #fff; box-shadow: -4px 0 24px rgba(0,0,0,0.12);'
      + '  transform: translateX(100%);'
      + '  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);'
      + '  display: flex; flex-direction: column;'
      + '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;'
      + '}'
      + '.mockup-info-panel--open { transform: translateX(0); }'

      /* 패널 헤더 */
      + '.mockup-info-panel__header {'
      + '  display: flex; align-items: center; justify-content: space-between;'
      + '  padding: 20px 24px 16px; border-bottom: 1px solid #e5e7eb;'
      + '  flex-shrink: 0;'
      + '}'
      + '.mockup-info-panel__title {'
      + '  font-size: 16px; font-weight: 700; color: #111827; margin: 0;'
      + '}'
      + '.mockup-info-panel__close {'
      + '  background: none; border: none; cursor: pointer;'
      + '  width: 32px; height: 32px; border-radius: 6px;'
      + '  display: flex; align-items: center; justify-content: center;'
      + '  color: #6b7280; font-size: 18px; transition: background 0.15s;'
      + '}'
      + '.mockup-info-panel__close:hover { background: #f3f4f6; color: #111827; }'

      /* 패널 본문 */
      + '.mockup-info-panel__body {'
      + '  flex: 1; overflow-y: auto; padding: 20px 24px 32px;'
      + '}'

      /* 섹션 */
      + '.mockup-info-section { margin-bottom: 24px; }'
      + '.mockup-info-section__label {'
      + '  font-size: 11px; font-weight: 700; color: #6b7280;'
      + '  text-transform: uppercase; letter-spacing: 0.05em;'
      + '  margin-bottom: 10px;'
      + '}'
      + '.mockup-info-section__desc {'
      + '  font-size: 13.5px; color: #374151; line-height: 1.6; margin-bottom: 0;'
      + '}'

      /* 변경사항 리스트 */
      + '.mockup-info-changes { list-style: none; padding: 0; margin: 0; }'
      + '.mockup-info-changes li {'
      + '  position: relative; padding: 8px 0 8px 20px;'
      + '  font-size: 13.5px; color: #374151; line-height: 1.5;'
      + '  border-bottom: 1px solid #f3f4f6;'
      + '}'
      + '.mockup-info-changes li:last-child { border-bottom: none; }'
      + '.mockup-info-changes li::before {'
      + '  content: ""; position: absolute; left: 2px; top: 14px;'
      + '  width: 7px; height: 7px; border-radius: 50%; background: #3b82f6;'
      + '}'

      /* 티켓/스토리 카드 */
      + '.mockup-info-card {'
      + '  display: block; padding: 10px 14px; margin-bottom: 8px;'
      + '  background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;'
      + '  text-decoration: none; color: inherit;'
      + '  transition: border-color 0.15s, background 0.15s;'
      + '}'
      + '.mockup-info-card:hover { border-color: #93c5fd; background: #eff6ff; }'
      + '.mockup-info-card__key {'
      + '  font-size: 12px; font-weight: 700; color: #3b82f6; margin-right: 8px;'
      + '}'
      + '.mockup-info-card__title {'
      + '  font-size: 13px; color: #374151;'
      + '}'

      /* 구분선 */
      + '.mockup-info-divider {'
      + '  border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px;'
      + '}';

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ============================================================
  // 패널 HTML 생성
  // ============================================================
  function buildPanelHTML(info) {
    if (!info) {
      info = {
        title: getCurrentPage(),
        description: '이 페이지에 대한 설명이 아직 등록되지 않았습니다.',
        changes: [],
        userStories: [],
        jiraTickets: [],
      };
    }

    var html = '';

    // 페이지 정보
    html += '<div class="mockup-info-section">';
    html += '  <div class="mockup-info-section__label">페이지 정보</div>';
    html += '  <p class="mockup-info-section__desc"><strong>' + info.title + '</strong></p>';
    html += '  <p class="mockup-info-section__desc">' + info.description + '</p>';
    html += '</div>';

    // 변경사항
    if (info.changes && info.changes.length) {
      html += '<hr class="mockup-info-divider">';
      html += '<div class="mockup-info-section">';
      html += '  <div class="mockup-info-section__label">주요 변경사항</div>';
      html += '  <ul class="mockup-info-changes">';
      for (var i = 0; i < info.changes.length; i++) {
        html += '    <li>' + info.changes[i] + '</li>';
      }
      html += '  </ul>';
      html += '</div>';
    }

    // 정책
    if (info.policies && info.policies.length) {
      html += '<hr class="mockup-info-divider">';
      html += '<div class="mockup-info-section">';
      html += '  <div class="mockup-info-section__label">정책</div>';
      html += '  <ul class="mockup-info-changes">';
      for (var p = 0; p < info.policies.length; p++) {
        html += '    <li>' + info.policies[p] + '</li>';
      }
      html += '  </ul>';
      html += '</div>';
    }

    // User Story
    if (info.userStories && info.userStories.length) {
      html += '<hr class="mockup-info-divider">';
      html += '<div class="mockup-info-section">';
      html += '  <div class="mockup-info-section__label">User Story</div>';
      for (var j = 0; j < info.userStories.length; j++) {
        var us = info.userStories[j];
        html += '  <div class="mockup-info-card">';
        html += '    <span class="mockup-info-card__key">' + us.id + '</span>';
        html += '    <span class="mockup-info-card__title">' + us.title + '</span>';
        html += '  </div>';
      }
      html += '</div>';
    }

    // Jira Ticket
    if (info.jiraTickets && info.jiraTickets.length) {
      html += '<hr class="mockup-info-divider">';
      html += '<div class="mockup-info-section">';
      html += '  <div class="mockup-info-section__label">Jira Ticket</div>';
      for (var k = 0; k < info.jiraTickets.length; k++) {
        var jt = info.jiraTickets[k];
        var tag = jt.url ? 'a' : 'div';
        var hrefAttr = jt.url ? ' href="' + jt.url + '" target="_blank" rel="noopener"' : '';
        html += '  <' + tag + ' class="mockup-info-card"' + hrefAttr + '>';
        html += '    <span class="mockup-info-card__key">' + jt.key + '</span>';
        html += '    <span class="mockup-info-card__title">' + jt.title + '</span>';
        html += '  </' + tag + '>';
      }
      html += '</div>';
    }

    return html;
  }

  // ============================================================
  // 초기화
  // ============================================================
  function init() {
    injectStyles();

    var currentPage = getCurrentPage();
    var info = PAGE_INFO[currentPage] || null;

    // 플로팅 버튼
    var fab = document.createElement('button');
    fab.className = 'mockup-info-fab';
    fab.textContent = '?';
    fab.title = '화면 변경사항 정보';

    // 오버레이
    var overlay = document.createElement('div');
    overlay.className = 'mockup-info-overlay';

    // 사이드 패널
    var panel = document.createElement('div');
    panel.className = 'mockup-info-panel';
    panel.innerHTML =
      '<div class="mockup-info-panel__header">' +
      '  <h2 class="mockup-info-panel__title">변경사항 정보</h2>' +
      '  <button class="mockup-info-panel__close" id="mockupInfoClose">&times;</button>' +
      '</div>' +
      '<div class="mockup-info-panel__body">' +
      buildPanelHTML(info) +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    document.body.appendChild(fab);

    // 토글 동작
    var isOpen = false;

    function openPanel() {
      isOpen = true;
      panel.classList.add('mockup-info-panel--open');
      overlay.classList.add('mockup-info-overlay--open');
      fab.classList.add('mockup-info-fab--active');
      fab.textContent = '\u00D7';
    }

    function closePanel() {
      isOpen = false;
      panel.classList.remove('mockup-info-panel--open');
      overlay.classList.remove('mockup-info-overlay--open');
      fab.classList.remove('mockup-info-fab--active');
      fab.textContent = '?';
    }

    fab.addEventListener('click', function () {
      if (isOpen) closePanel(); else openPanel();
    });

    overlay.addEventListener('click', closePanel);

    panel.querySelector('#mockupInfoClose').addEventListener('click', closePanel);

    // ESC 키로 닫기
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closePanel();
    });
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
