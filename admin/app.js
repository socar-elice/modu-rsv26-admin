/**
 * 제휴주차상품 생성 - Standalone Form Controller
 * 기존 Vue SPA 스냅샷 기반 독립 동작 스크립트
 */
(function () {
  'use strict';

  // ─── State Model (기존 payload 네이밍 준수) ───
  const formState = {
    // 기본 정보
    eventSeq: '',
    parkinglotSeq: '4325',
    parkinglotName: '',
    couponTypeSeq: '20000', // 단기권 default
    couponTypeName: '단기권',
    couponName: '',
    couponMemo: '',
    minUsageDays: '',
    maxUsageDays: '',
    couponStartDate: '',
    couponEndDate: '',

    // 섹션 A: 상품 키워드
    keywords: [],

    // 섹션 B: D- 구매가능 시작/마감
    purchasePeriodMode: 'days', // 'days' | 'datetime' (시작일만 적용)
    purchaseStartDays: '',
    purchaseEndDays: '', // 항상 숫자(일) 단위
    purchaseStartDateTime: '', // 시작일 날짜/시간 모드

    // 섹션 C: 공항선택
    airportCode: '',
    airportName: '',

    // 정산비율
    parkinglotSettlementRatio: '',

    // 가격설정 모드
    pricingMode: 'dayOfWeek', // 'dayOfWeek' | 'batch'

    // 최소이용금액
    minimumPrice: '',
    minimumSettlementAmount: '',

    // 요일별 판매정책
    dayOfWeekPolicies: [
      { dayOfWeek: '월요일', saleStatus: false, price: '', settlementAmount: '', maxStock: '' },
      { dayOfWeek: '화요일', saleStatus: false, price: '', settlementAmount: '', maxStock: '' },
      { dayOfWeek: '수요일', saleStatus: false, price: '', settlementAmount: '', maxStock: '' },
      { dayOfWeek: '목요일', saleStatus: false, price: '', settlementAmount: '', maxStock: '' },
      { dayOfWeek: '금요일', saleStatus: false, price: '', settlementAmount: '', maxStock: '' },
      { dayOfWeek: '토요일', saleStatus: false, price: '', settlementAmount: '', maxStock: '' },
      { dayOfWeek: '일요일', saleStatus: false, price: '', settlementAmount: '', maxStock: '' }
    ],

    // 공휴일 판매정책
    holidayPolicy: { saleStatus: false, price: '', settlementAmount: '', maxStock: '' },

    // 옵션 가격정책
    addonPolicies: [
      { addonPolicyType: '추가요금', saleStatus: false, price: '', settlementAmount: '' },
      { addonPolicyType: '발렛 픽업/전송', saleStatus: false, price: '', settlementAmount: '' },
      { addonPolicyType: '심야 입차', saleStatus: false, price: '', settlementAmount: '' },
      { addonPolicyType: '심야 출차', saleStatus: false, price: '', settlementAmount: '' }
    ],

    // 안내사항
    notice: '',
    beforePaymentCaution: '',
    afterPaymentCaution: '',

    // 안내메시지
    messageType: '',
    templateKey: '',

    // 사용자 입력정보
    userInputFields: [],

    // 예매 가능 마감 설정
    deadlineUnit: 'hour',   // 'hour' | 'day'
    deadlineValue: ''       // 문자열 (입력 원본)
  };

  // ─── 상품유형 매핑 (기존 코드 구조 준수) ───
  const PRODUCT_TYPES = {
    '당일권': { seq: '10001', category: 'DAILY' },
    '주간권': { seq: '10002', category: 'DAILY' },
    '오전권': { seq: '10003', category: 'DAILY' },
    '오후권': { seq: '10004', category: 'DAILY' },
    '야간권': { seq: '10005', category: 'DAILY' },
    '심야권': { seq: '10006', category: 'DAILY' },
    '시간권': { seq: '10007', category: 'DAILY' },
    '연박권': { seq: '10008', category: 'DAILY' },
    '기간권': { seq: '15001', category: 'MONTHLY' },
    '월단위권': { seq: '15002', category: 'MONTHLY' },
    '일할권': { seq: '15003', category: 'MONTHLY' },
    '단기권': { seq: '20000', category: 'PERIOD' }
  };

  // ─── 키워드 매핑 ───
  const KEYWORD_MAP = {
    '1': '발렛',
    '2': '실내',
    '3': '실외',
    '4': '기계식 전용',
    '5': '픽업/샌딩',
    '6': '세차'
  };

  // ─── 공항 매핑 ───
  const AIRPORT_MAP = {
    '인천공항 T1': 'ICN_T1',
    '인천공항 T2': 'ICN_T2',
    '김포공항': 'GMP'
  };

  // ─── DOM 유틸 ───
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  // ─── 정산금액 계산 (정산비율 기반) ───
  function calcSettlement(price) {
    const ratio = parseFloat(formState.parkinglotSettlementRatio) || 0;
    if (!price || !ratio) return '';
    return Math.floor(price * ratio / 100);
  }

  // ─── 에러 표시 / 제거 ───
  function showError(inputEl, message) {
    removeError(inputEl);
    inputEl.classList.add('is-invalid');
    inputEl.style.borderColor = '#dc3545';
    const errDiv = document.createElement('div');
    errDiv.className = 'invalid-feedback';
    errDiv.style.display = 'block';
    errDiv.style.color = '#dc3545';
    errDiv.style.fontSize = '12px';
    errDiv.style.marginTop = '4px';
    errDiv.textContent = message;
    inputEl.parentNode.appendChild(errDiv);
  }

  function removeError(inputEl) {
    inputEl.classList.remove('is-invalid');
    inputEl.style.borderColor = '';
    const existing = inputEl.parentNode.querySelector('.invalid-feedback');
    if (existing) existing.remove();
  }

  // ─── D- 입력 검증 (0~30 정수) ───
  function validateDInput(inputEl, fieldName) {
    const val = inputEl.value.trim();
    if (val === '') {
      removeError(inputEl);
      return true;
    }
    const num = Number(val);
    if (!Number.isInteger(num) || num < 0 || num > 30) {
      showError(inputEl, `${fieldName} 항목은 0~30 사이의 정수만 입력 가능합니다.`);
      return false;
    }
    removeError(inputEl);
    return true;
  }

  // ─── 숫자 입력 검증 (양의 정수) ───
  function validatePositiveInt(inputEl, fieldName) {
    const val = inputEl.value.trim();
    if (val === '') {
      removeError(inputEl);
      return true;
    }
    const num = Number(val);
    if (!Number.isInteger(num) || num < 0) {
      showError(inputEl, `${fieldName} 항목은 0 이상의 정수만 입력 가능합니다.`);
      return false;
    }
    removeError(inputEl);
    return true;
  }

  // ─── 드롭다운 토글 기능 ───
  function setupDropdown(toggleBtn) {
    const dropdown = toggleBtn.closest('.dropdown, .b-dropdown');
    if (!dropdown) return;
    const menu = dropdown.querySelector('.dropdown-menu');
    if (!menu) return;

    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      // Close all other dropdowns first
      $$('.dropdown-menu.show').forEach(function (m) {
        if (m !== menu) {
          m.classList.remove('show');
          m.closest('.dropdown, .b-dropdown').querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
        }
      });
      const isOpen = menu.classList.contains('show');
      menu.classList.toggle('show');
      toggleBtn.setAttribute('aria-expanded', !isOpen);
    });

    // Setup menu items
    menu.querySelectorAll('.dropdown-item, button.dropdown-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const text = item.textContent.trim();
        toggleBtn.textContent = text;
        menu.classList.remove('show');
        toggleBtn.setAttribute('aria-expanded', 'false');
        // Fire custom event
        toggleBtn.dispatchEvent(new CustomEvent('dropdown-select', { detail: { value: text } }));
      });
    });
  }

  // ─── 스위치 토글 기능 ───
  function setupSwitch(switchInput) {
    switchInput.addEventListener('change', function () {
      const isChecked = switchInput.checked;
      const row = switchInput.closest('tr');
      if (row) {
        const inputs = row.querySelectorAll('input[type="number"]');
        inputs.forEach(function (inp) {
          inp.disabled = !isChecked;
          if (!isChecked) {
            inp.style.opacity = '0.5';
          } else {
            inp.style.opacity = '1';
          }
        });
      }
    });
  }

  // ─── 체크박스 그룹 기능 ───
  function setupCheckboxGroup() {
    // 상품 키워드 체크박스 - name="__BVID__1802" 기반
    var keywordCell = null;
    $$('td[data-label]').forEach(function (td) {
      var label = td.getAttribute('data-label') || '';
      if (label.indexOf('키워드') !== -1) {
        keywordCell = td;
      }
    });

    var checkboxes;
    if (keywordCell) {
      checkboxes = Array.from(keywordCell.querySelectorAll('input[type="checkbox"]'));
    } else {
      // Fallback: find by name attribute
      checkboxes = $$('input[type="checkbox"][name*="1802"]');
    }

    if (checkboxes.length === 0) {
      console.warn('[Keyword] No keyword checkboxes found');
      return;
    }

    console.log('[Keyword] Found', checkboxes.length, 'keyword checkboxes');

    checkboxes.forEach(function (cb) {
      cb.addEventListener('change', function () {
        formState.keywords = [];
        checkboxes.forEach(function (c) {
          if (c.checked) {
            formState.keywords.push(c.value);
          }
        });
        updatePayloadPreview();
      });
    });
  }

  // ─── 구매가능 기간 모드 전환 ───
  function setupPurchasePeriodModeToggle() {
    $$('.input-group-text').forEach(function (label) {
      if (label.textContent.trim() === 'D-') {
        const inputGroup = label.closest('.input-group');
        const cell = inputGroup ? inputGroup.closest('td') : null;
        if (!cell) return;

        const dataLabel = cell.getAttribute('data-label') || '';
        const isStartField = dataLabel.indexOf('시작') !== -1;
        const isEndField = dataLabel.indexOf('마감') !== -1;

        // 모드 선택은 시작일에만 적용 (마감일은 숫자만)
        if (!isStartField) return;
        if (isEndField) return;

        // Create mode selector only once per field type
        if (cell.querySelector('.purchase-period-mode-selector')) return;

        // Create mode selector
        const modeSelector = document.createElement('div');
        modeSelector.className = 'purchase-period-mode-selector';
        modeSelector.innerHTML =
          '<div class="btn-group btn-group-sm mb-2" role="group">' +
            '<button type="button" class="btn btn-outline-primary active" data-mode="days">D- 기준</button>' +
            '<button type="button" class="btn btn-outline-primary" data-mode="datetime">날짜/시간</button>' +
          '</div>';

        // Create datetime input (hidden by default)
        const datetimeGroup = document.createElement('div');
        datetimeGroup.className = 'datetime-input-group';
        datetimeGroup.style.display = 'none';
        datetimeGroup.innerHTML =
          '<input type="datetime-local" class="form-control" />';

        // Insert before the D- input group
        const formGroup = inputGroup.closest('.form-group');
        if (formGroup) {
          formGroup.insertBefore(modeSelector, formGroup.firstChild);
          formGroup.appendChild(datetimeGroup);
        }

        // Setup mode toggle handlers
        const buttons = modeSelector.querySelectorAll('button');
        const daysInput = inputGroup;
        const datetimeInput = datetimeGroup.querySelector('input');

        buttons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            const mode = btn.getAttribute('data-mode');

            // Update button states
            buttons.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            // Toggle visibility
            if (mode === 'days') {
              daysInput.style.display = '';
              datetimeGroup.style.display = 'none';
              formState.purchasePeriodMode = 'days';
            } else {
              daysInput.style.display = 'none';
              datetimeGroup.style.display = '';
              formState.purchasePeriodMode = 'datetime';
            }

            updatePayloadPreview();
          });
        });

        // Setup datetime input handler (시작일만)
        datetimeInput.addEventListener('input', function () {
          formState.purchaseStartDateTime = datetimeInput.value;
          updatePayloadPreview();
        });
      }
    });
  }

  // ─── D- 입력 필드 기능 ───
  function setupDInputs() {
    // Find D- inputs by their prepend text
    $$('.input-group-text').forEach(function (label) {
      if (label.textContent.trim() === 'D-') {
        const input = label.closest('.input-group').querySelector('input[type="number"]');
        if (!input) return;

        // Determine which field this is
        const cell = input.closest('td');
        const dataLabel = cell ? cell.getAttribute('data-label') : '';

        input.addEventListener('input', function () {
          // Enforce integer only
          var val = input.value;
          if (val.indexOf('.') !== -1 || val.indexOf('-') !== -1 || val.indexOf('e') !== -1) {
            input.value = val.replace(/[.\-eE]/g, '');
          }
          // Clamp to 0-30
          var num = parseInt(input.value);
          if (!isNaN(num)) {
            if (num > 30) input.value = '30';
            if (num < 0) input.value = '0';
          }

          if (dataLabel.indexOf('시작') !== -1) {
            formState.purchaseStartDays = input.value;
            validateDInput(input, '구매가능 시작일');
          } else if (dataLabel.indexOf('마감') !== -1) {
            formState.purchaseEndDays = input.value;
            validateDInput(input, '구매가능 마감일');
          }
          updatePayloadPreview();
        });

        // Prevent non-integer input
        input.addEventListener('keydown', function (e) {
          if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
          }
        });

        // Set min/max attributes
        input.setAttribute('min', '0');
        input.setAttribute('max', '30');
        input.setAttribute('step', '1');
      }
    });
  }

  // ─── 공항선택 드롭다운 기능 ───
  function setupAirportDropdown() {
    // data-label로 찾기 (NFD/NFC 안전)
    var airportCell = findCellByLabel('공항선택');
    if (!airportCell) {
      console.warn('[Airport] Airport dropdown cell not found');
      return;
    }
    const toggleBtn = airportCell.querySelector('.dropdown-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('dropdown-select', function (e) {
      const name = e.detail.value;
      formState.airportName = name;
      formState.airportCode = AIRPORT_MAP[name] || '';
      updatePayloadPreview();
    });

    console.log('[Airport] Airport dropdown initialized');
  }

  // ─── data-label 부분 매칭으로 셀 찾기 (NFD/NFC 안전) ───
  function findCellByLabel(partialLabel) {
    var cells = $$('td[data-label]');
    for (var i = 0; i < cells.length; i++) {
      var label = cells[i].getAttribute('data-label') || '';
      if (label.indexOf(partialLabel) !== -1) {
        return cells[i];
      }
    }
    return null;
  }

  // ─── 상품유형 드롭다운 기능 ───
  function setupProductTypeDropdown() {
    const typeCell = findCellByLabel('주차권 유형');
    if (!typeCell) {
      console.warn('[ProductType] Product type cell not found');
      return;
    }
    const toggleBtn = typeCell.querySelector('.dropdown-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('dropdown-select', function (e) {
      const name = e.detail.value;
      const typeInfo = PRODUCT_TYPES[name];
      if (typeInfo) {
        formState.couponTypeSeq = typeInfo.seq;
        formState.couponTypeName = name;
        // 모든 상품유형에서 공통 섹션 표시 (요일별 설정, 공휴일 등)
        showAllCommonSections();
      }
      updatePayloadPreview();
    });
  }

  // ─── 모든 공통 섹션 표시 ───
  function showAllCommonSections() {
    // 요일별 설정/일괄 가격설정 섹션
    $$('[data-v-8f72085b]').forEach(function (el) {
      el.style.display = '';
    });
    // 공항 템플릿 섹션
    $$('[data-v-338be43b]').forEach(function (el) {
      el.style.display = '';
    });
    // 모든 section 표시
    $$('[data-v-1e67e77e] > div').forEach(function (el) {
      el.style.display = '';
    });
  }

  // ─── 요일별/일괄 토글 기능 ───
  function setupPricingModeToggle() {
    const pricingToggle = $$('.dropdown-toggle').find(function (btn) {
      return btn.textContent.trim() === '요일별 설정' || btn.textContent.trim() === '일괄요금 설정';
    });
    if (!pricingToggle) return;

    pricingToggle.addEventListener('dropdown-select', function (e) {
      const mode = e.detail.value;
      if (mode.includes('일괄')) {
        formState.pricingMode = 'batch';
        switchToBatchMode();
      } else {
        formState.pricingMode = 'dayOfWeek';
        switchToDayOfWeekMode();
      }
      updatePayloadPreview();
    });
  }

  function switchToBatchMode() {
    // 요일별 테이블의 개별 가격 입력을 비활성화하고, 최소이용금액의 일괄 입력값을 모든 요일에 반영
    const dayTable = findSectionByTitle('기본 판매정책');
    if (dayTable) {
      dayTable.style.opacity = '0.6';
      dayTable.querySelectorAll('input[type="number"]').forEach(function (inp) {
        if (!inp.closest('.document-saleStatus')) {
          inp.setAttribute('readonly', 'readonly');
        }
      });
    }
    // 최소이용금액 섹션을 일괄 입력 모드로 활성화
    const minSection = findSectionByTitle('최소이용금액');
    if (minSection) {
      minSection.style.opacity = '1';
      minSection.querySelectorAll('input[type="number"]').forEach(function (inp) {
        inp.removeAttribute('readonly');
      });
    }
  }

  function switchToDayOfWeekMode() {
    const dayTable = findSectionByTitle('기본 판매정책');
    if (dayTable) {
      dayTable.style.opacity = '1';
      dayTable.querySelectorAll('input[type="number"]').forEach(function (inp) {
        inp.removeAttribute('readonly');
      });
    }
  }

  function findSectionByTitle(title) {
    const headers = $$('.section--title');
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].textContent.trim() === title) {
        return headers[i].closest('section');
      }
    }
    return null;
  }

  // ─── 정산비율 연동 ───
  function setupSettlementRatio() {
    const ratioInput = $('#parkinglotSettlementRatio');
    if (!ratioInput) return;

    ratioInput.addEventListener('input', function () {
      formState.parkinglotSettlementRatio = ratioInput.value;
      // 모든 정산금액 필드 자동 계산
      recalcAllSettlements();
      updatePayloadPreview();
    });
  }

  function recalcAllSettlements() {
    // 최소이용금액
    const minSection = findSectionByTitle('최소이용금액');
    if (minSection) {
      const priceInput = minSection.querySelector('.document-price input');
      const settlementInput = minSection.querySelector('.document-settlementAmount input');
      if (priceInput && settlementInput) {
        const v = calcSettlement(priceInput.value);
        settlementInput.value = v;
        formState.minimumSettlementAmount = v;
      }
    }

    // 요일별 판매정책
    const daySection = findSectionByTitle('기본 판매정책');
    if (daySection) {
      daySection.querySelectorAll('tbody tr').forEach(function (row, idx) {
        const priceInput = row.querySelector('.document-price input');
        const settlementInput = row.querySelector('.document-settlementAmount input');
        if (priceInput && settlementInput) {
          const v = calcSettlement(priceInput.value);
          settlementInput.value = v;
          if (formState.dayOfWeekPolicies[idx]) {
            formState.dayOfWeekPolicies[idx].settlementAmount = v;
          }
        }
      });
    }

    // 공휴일 판매정책
    const holidaySection = findSectionByTitle('공휴일 판매정책');
    if (holidaySection) {
      const priceInput = holidaySection.querySelector('.document-price input');
      const settlementInput = holidaySection.querySelector('.document-settlementAmount input');
      if (priceInput && settlementInput) {
        const v = calcSettlement(priceInput.value);
        settlementInput.value = v;
        formState.holidayPolicy.settlementAmount = v;
      }
    }

    // 옵션 가격정책
    const optionSection = findSectionByTitle('옵션 가격정책');
    if (optionSection) {
      optionSection.querySelectorAll('tbody tr').forEach(function (row, idx) {
        const priceInput = row.querySelector('.document-price input');
        const settlementInput = row.querySelector('.document-settlementAmount input');
        if (priceInput && settlementInput) {
          const v = calcSettlement(priceInput.value);
          settlementInput.value = v;
          if (formState.addonPolicies[idx]) {
            formState.addonPolicies[idx].settlementAmount = v;
          }
        }
      });
    }
  }

  // ─── 가격 입력 이벤트 바인딩 ───
  function setupPriceInputs() {
    // 최소이용금액
    var minSection = findSectionByTitle('최소이용금액');
    if (minSection) {
      var priceInput = minSection.querySelector('.document-price input');
      if (priceInput) {
        priceInput.addEventListener('input', function () {
          formState.minimumPrice = priceInput.value;
          validatePositiveInt(priceInput, '판매금액');
          recalcAllSettlements();
          updatePayloadPreview();
        });
      }
    }

    // 요일별 판매정책
    var daySection = findSectionByTitle('기본 판매정책');
    if (daySection) {
      daySection.querySelectorAll('tbody tr').forEach(function (row, idx) {
        var priceInput = row.querySelector('.document-price input');
        var stockInput = row.querySelector('.document-maxStock input');
        var switchInput = row.querySelector('.custom-control-input[type="checkbox"]');

        if (priceInput) {
          priceInput.addEventListener('input', function () {
            if (formState.dayOfWeekPolicies[idx]) {
              formState.dayOfWeekPolicies[idx].price = priceInput.value;
            }
            validatePositiveInt(priceInput, '판매금액');
            recalcAllSettlements();
            updatePayloadPreview();
          });
        }
        if (stockInput) {
          stockInput.addEventListener('input', function () {
            if (formState.dayOfWeekPolicies[idx]) {
              formState.dayOfWeekPolicies[idx].maxStock = stockInput.value;
            }
            validatePositiveInt(stockInput, '판매수량');
            updatePayloadPreview();
          });
        }
        if (switchInput) {
          switchInput.addEventListener('change', function () {
            if (formState.dayOfWeekPolicies[idx]) {
              formState.dayOfWeekPolicies[idx].saleStatus = switchInput.checked;
            }
            updatePayloadPreview();
          });
        }
      });
    }

    // 공휴일 판매정책
    var holidaySection = findSectionByTitle('공휴일 판매정책');
    if (holidaySection) {
      var hPriceInput = holidaySection.querySelector('.document-price input');
      var hStockInput = holidaySection.querySelector('.document-maxStock input');
      var hSwitch = holidaySection.querySelector('.custom-control-input[type="checkbox"]');

      if (hPriceInput) {
        hPriceInput.addEventListener('input', function () {
          formState.holidayPolicy.price = hPriceInput.value;
          validatePositiveInt(hPriceInput, '공휴일 판매금액');
          recalcAllSettlements();
          updatePayloadPreview();
        });
      }
      if (hStockInput) {
        hStockInput.addEventListener('input', function () {
          formState.holidayPolicy.maxStock = hStockInput.value;
          validatePositiveInt(hStockInput, '공휴일 판매수량');
          updatePayloadPreview();
        });
      }
      if (hSwitch) {
        hSwitch.addEventListener('change', function () {
          formState.holidayPolicy.saleStatus = hSwitch.checked;
          updatePayloadPreview();
        });
      }
    }

    // 옵션 가격정책
    var optionSection = findSectionByTitle('옵션 가격정책');
    if (optionSection) {
      optionSection.querySelectorAll('tbody tr').forEach(function (row, idx) {
        var priceInput = row.querySelector('.document-price input');
        var switchInput = row.querySelector('.custom-control-input[type="checkbox"]');

        if (priceInput) {
          priceInput.addEventListener('input', function () {
            if (formState.addonPolicies[idx]) {
              formState.addonPolicies[idx].price = priceInput.value;
            }
            validatePositiveInt(priceInput, '판매금액');
            recalcAllSettlements();
            updatePayloadPreview();
          });
        }
        if (switchInput) {
          switchInput.addEventListener('change', function () {
            if (formState.addonPolicies[idx]) {
              formState.addonPolicies[idx].saleStatus = switchInput.checked;
            }
            updatePayloadPreview();
          });
        }
      });
    }
  }

  // ─── 기본 텍스트 입력 필드 바인딩 ───
  function setupBasicInputs() {
    // 주차권 이름
    var nameCell = findCellByLabel('주차권 이름');
    if (nameCell) {
      var inp = nameCell.querySelector('input');
      if (inp) inp.addEventListener('input', function () {
        formState.couponName = inp.value;
        updatePayloadPreview();
      });
    }

    // 주차권 메모
    var memoCell = findCellByLabel('주차권 메모');
    if (memoCell) {
      var inp2 = memoCell.querySelector('input, textarea');
      if (inp2) inp2.addEventListener('input', function () {
        formState.couponMemo = inp2.value;
        updatePayloadPreview();
      });
    }

    // 최소 이용일 수
    var minDaysCell = findCellByLabel('최소 이용일');
    if (minDaysCell) {
      var inp3 = minDaysCell.querySelector('input');
      if (inp3) inp3.addEventListener('input', function () {
        formState.minUsageDays = inp3.value;
        updatePayloadPreview();
      });
    }

    // 최대 이용가능일 수
    var maxDaysCell = findCellByLabel('최대 이용');
    if (maxDaysCell) {
      var inp4 = maxDaysCell.querySelector('input');
      if (inp4) inp4.addEventListener('input', function () {
        formState.maxUsageDays = inp4.value;
        updatePayloadPreview();
      });
    }

    // 안내사항
    var noticeCell = findCellByLabel('안내사항');
    if (noticeCell) {
      var ta = noticeCell.querySelector('textarea, input');
      if (ta) ta.addEventListener('input', function () {
        formState.notice = ta.value;
        updatePayloadPreview();
      });
    }

    // 구매전 주의사항
    var beforeCell = findCellByLabel('구매전');
    if (beforeCell) {
      var ta2 = beforeCell.querySelector('textarea, input');
      if (ta2) ta2.addEventListener('input', function () {
        formState.beforePaymentCaution = ta2.value;
        updatePayloadPreview();
      });
    }

    // 구매후 주의사항
    var afterCell = findCellByLabel('구매후');
    if (afterCell) {
      var ta3 = afterCell.querySelector('textarea, input');
      if (ta3) ta3.addEventListener('input', function () {
        formState.afterPaymentCaution = ta3.value;
        updatePayloadPreview();
      });
    }
  }

  // ─── 폼 제출 핸들러 ───
  function setupFormSubmit() {
    var forms = $$('form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Run all validations
        var isValid = runFullValidation();
        if (isValid) {
          var payload = buildPayload();
          console.log('=== 저장 Payload ===');
          console.log(JSON.stringify(payload, null, 2));
          showAdminToast('상품이 저장되었습니다 (목업).', 'success');
          showPayloadModal(payload);
        }
      });
    });

    // 생성하기 버튼
    var submitBtns = $$('button[type="submit"]');
    submitBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var isValid = runFullValidation();
        if (isValid) {
          var payload = buildPayload();
          console.log('=== 저장 Payload ===');
          console.log(JSON.stringify(payload, null, 2));
          showAdminToast('상품이 저장되었습니다 (목업).', 'success');
          showPayloadModal(payload);
        }
      });
    });

    // 취소 버튼
    var cancelBtns = $$('button.btn-white');
    cancelBtns.forEach(function (btn) {
      if (btn.textContent.trim() === '취소') {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          if (confirm('작성 중인 내용이 초기화됩니다. 취소하시겠습니까?')) {
            location.reload();
          }
        });
      }
    });
  }

  // ─── 전체 검증 ───
  function runFullValidation() {
    var valid = true;
    var firstErrorSection = null;

    // D- 입력 검증
    $$('.input-group-text').forEach(function (label) {
      if (label.textContent.trim() === 'D-') {
        var input = label.closest('.input-group').querySelector('input[type="number"]');
        if (input) {
          var cell = input.closest('td');
          var dataLabel = cell ? cell.getAttribute('data-label') : '값';
          if (!validateDInput(input, dataLabel)) {
            valid = false;
          }
        }
      }
    });

    // 가격 입력 검증
    $$('.document-price input[type="number"]').forEach(function (inp) {
      if (inp.value && !validatePositiveInt(inp, '판매금액')) {
        valid = false;
      }
    });

    $$('.document-maxStock input[type="number"]').forEach(function (inp) {
      if (inp.value && !validatePositiveInt(inp, '판매수량')) {
        valid = false;
      }
    });

    // 예매 가능 마감 검증
    deadlineInputDirty = true;
    var dlResult = validateDeadlineValue();
    renderDeadlineError();
    renderDeadlineSummary();
    if (!dlResult.valid) {
      valid = false;
      if (!firstErrorSection) {
        var dlSection = document.getElementById('section-deadline');
        if (dlSection) {
          dlSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          dlSection.style.transition = 'box-shadow 300ms ease';
          dlSection.style.boxShadow = '0 0 0 3px rgba(220,53,69,0.18)';
          setTimeout(function () { dlSection.style.boxShadow = ''; }, 2000);
        }
      }
    }

    if (!valid) {
      showAdminToast('입력값을 확인해 주세요.', 'error');
    }

    return valid;
  }

  // ─── Payload 빌드 ───
  function buildPayload() {
    // Sync all current input values to state
    syncFormToState();

    return {
      parkinglotSeq: formState.parkinglotSeq,
      couponTypeSeq: formState.couponTypeSeq,
      couponTypeName: formState.couponTypeName,
      couponName: formState.couponName,
      couponMemo: formState.couponMemo,
      minUsageDays: formState.minUsageDays,
      maxUsageDays: formState.maxUsageDays,
      couponStartDate: formState.couponStartDate,
      couponEndDate: formState.couponEndDate,
      keywords: formState.keywords,
      purchasePeriodMode: formState.purchasePeriodMode,
      purchaseStartDays: formState.purchaseStartDays,
      purchaseEndDays: formState.purchaseEndDays,
      purchaseStartDateTime: formState.purchaseStartDateTime,
      airportCode: formState.airportCode,
      airportName: formState.airportName,
      parkinglotSettlementRatio: formState.parkinglotSettlementRatio,
      pricingMode: formState.pricingMode,
      minimumPrice: formState.minimumPrice,
      minimumSettlementAmount: formState.minimumSettlementAmount,
      dayOfWeekPolicies: formState.dayOfWeekPolicies,
      holidayPolicy: formState.holidayPolicy,
      addonPolicies: formState.addonPolicies,
      notice: formState.notice,
      beforePaymentCaution: formState.beforePaymentCaution,
      afterPaymentCaution: formState.afterPaymentCaution,
      messageType: formState.messageType,
      templateKey: formState.templateKey,
      deadlineUnit: formState.deadlineUnit,
      deadlineValue: formState.deadlineValue ? parseInt(formState.deadlineValue, 10) : null
    };
  }

  // ─── State 동기화 (DOM → State) ───
  function syncFormToState() {
    // 키워드 체크박스 - data-label 기반으로 찾기
    formState.keywords = [];
    var keywordCell = null;
    $$('td[data-label]').forEach(function (td) {
      var label = td.getAttribute('data-label') || '';
      if (label.indexOf('키워드') !== -1) keywordCell = td;
    });
    if (keywordCell) {
      keywordCell.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
        if (cb.checked) formState.keywords.push(cb.value);
      });
    } else {
      $$('input[type="checkbox"][name*="1802"]').forEach(function (cb) {
        if (cb.checked) formState.keywords.push(cb.value);
      });
    }

    // D- inputs and datetime inputs
    $$('.input-group-text').forEach(function (label) {
      if (label.textContent.trim() === 'D-') {
        var input = label.closest('.input-group').querySelector('input[type="number"]');
        var cell = input ? input.closest('td') : null;
        if (input && cell) {
          var dataLabel = cell.getAttribute('data-label') || '';
          if (dataLabel.indexOf('시작') !== -1) {
            formState.purchaseStartDays = input.value;
            // 시작일: datetime input도 확인
            var datetimeInput = cell.querySelector('.datetime-input-group input[type="datetime-local"]');
            if (datetimeInput) {
              formState.purchaseStartDateTime = datetimeInput.value;
            }
          } else if (dataLabel.indexOf('마감') !== -1) {
            // 마감일: 숫자(일)만 저장
            formState.purchaseEndDays = input.value;
          }
        }
      }
    });

    // 정산비율
    var ratioInput = $('#parkinglotSettlementRatio');
    if (ratioInput) formState.parkinglotSettlementRatio = ratioInput.value;

    // 최소이용금액
    var minSection = findSectionByTitle('최소이용금액');
    if (minSection) {
      var mp = minSection.querySelector('.document-price input');
      var ms = minSection.querySelector('.document-settlementAmount input');
      if (mp) formState.minimumPrice = mp.value;
      if (ms) formState.minimumSettlementAmount = ms.value;
    }

    // 요일별 판매정책
    var daySection = findSectionByTitle('기본 판매정책');
    if (daySection) {
      daySection.querySelectorAll('tbody tr').forEach(function (row, idx) {
        if (!formState.dayOfWeekPolicies[idx]) return;
        var sw = row.querySelector('.custom-control-input[type="checkbox"]');
        var p = row.querySelector('.document-price input');
        var s = row.querySelector('.document-settlementAmount input');
        var q = row.querySelector('.document-maxStock input');
        if (sw) formState.dayOfWeekPolicies[idx].saleStatus = sw.checked;
        if (p) formState.dayOfWeekPolicies[idx].price = p.value;
        if (s) formState.dayOfWeekPolicies[idx].settlementAmount = s.value;
        if (q) formState.dayOfWeekPolicies[idx].maxStock = q.value;
      });
    }

    // 공휴일
    var holidaySection = findSectionByTitle('공휴일 판매정책');
    if (holidaySection) {
      var hsw = holidaySection.querySelector('.custom-control-input[type="checkbox"]');
      var hp = holidaySection.querySelector('.document-price input');
      var hs = holidaySection.querySelector('.document-settlementAmount input');
      var hq = holidaySection.querySelector('.document-maxStock input');
      if (hsw) formState.holidayPolicy.saleStatus = hsw.checked;
      if (hp) formState.holidayPolicy.price = hp.value;
      if (hs) formState.holidayPolicy.settlementAmount = hs.value;
      if (hq) formState.holidayPolicy.maxStock = hq.value;
    }

    // 옵션 가격정책
    var optSection = findSectionByTitle('옵션 가격정책');
    if (optSection) {
      optSection.querySelectorAll('tbody tr').forEach(function (row, idx) {
        if (!formState.addonPolicies[idx]) return;
        var sw = row.querySelector('.custom-control-input[type="checkbox"]');
        var p = row.querySelector('.document-price input');
        var s = row.querySelector('.document-settlementAmount input');
        if (sw) formState.addonPolicies[idx].saleStatus = sw.checked;
        if (p) formState.addonPolicies[idx].price = p.value;
        if (s) formState.addonPolicies[idx].settlementAmount = s.value;
      });
    }

    // 안내사항
    var noticeCell = findCellByLabel('안내사항');
    if (noticeCell) {
      var ta = noticeCell.querySelector('textarea, input');
      if (ta) formState.notice = ta.value;
    }

    // 구매전/후 주의사항
    var beforeCell = findCellByLabel('구매전');
    if (beforeCell) {
      var ta2 = beforeCell.querySelector('textarea, input');
      if (ta2) formState.beforePaymentCaution = ta2.value;
    }
    var afterCell = findCellByLabel('구매후');
    if (afterCell) {
      var ta3 = afterCell.querySelector('textarea, input');
      if (ta3) formState.afterPaymentCaution = ta3.value;
    }
  }

  // ─── Payload 모달 표시 ───
  function showPayloadModal(payload) {
    var overlay = document.getElementById('payload-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'payload-overlay';
      overlay.innerHTML = '<div id="payload-modal">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
        '<h5 style="margin:0;font-weight:700;">저장 Payload Preview</h5>' +
        '<button id="payload-close" style="background:none;border:none;font-size:20px;cursor:pointer;">&times;</button>' +
        '</div>' +
        '<pre id="payload-content" style="background:#f8f9fa;padding:16px;border-radius:4px;max-height:500px;overflow:auto;font-size:12px;white-space:pre-wrap;word-break:break-all;"></pre>' +
        '</div>';
      document.body.appendChild(overlay);

      document.getElementById('payload-close').addEventListener('click', function () {
        overlay.style.display = 'none';
      });
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.style.display = 'none';
      });
    }
    document.getElementById('payload-content').textContent = JSON.stringify(payload, null, 2);
    overlay.style.display = 'flex';
  }

  // ─── Payload 프리뷰 패널 (하단 고정) ───
  function createPayloadPreviewPanel() {
    var panel = document.createElement('div');
    panel.id = 'payload-preview-panel';
    panel.innerHTML =
      '<div id="payload-panel-header" style="cursor:pointer;">' +
      '<span style="font-weight:700;">Payload State</span>' +
      '<span id="payload-toggle-icon" style="float:right;">&#9650;</span>' +
      '</div>' +
      '<pre id="payload-panel-content"></pre>';
    document.body.appendChild(panel);

    var isCollapsed = false;
    document.getElementById('payload-panel-header').addEventListener('click', function () {
      isCollapsed = !isCollapsed;
      var content = document.getElementById('payload-panel-content');
      var icon = document.getElementById('payload-toggle-icon');
      if (isCollapsed) {
        content.style.display = 'none';
        icon.innerHTML = '&#9660;';
      } else {
        content.style.display = 'block';
        icon.innerHTML = '&#9650;';
      }
    });

    updatePayloadPreview();
  }

  function updatePayloadPreview() {
    var content = document.getElementById('payload-panel-content');
    if (content) {
      syncFormToState();
      var payload = buildPayload();
      content.textContent = JSON.stringify(payload, null, 2);
    }
  }

  // ─── 글로벌 클릭으로 드롭다운 닫기 ───
  function setupGlobalClickHandler() {
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.dropdown, .b-dropdown')) {
        $$('.dropdown-menu.show').forEach(function (menu) {
          menu.classList.remove('show');
          var toggle = menu.closest('.dropdown, .b-dropdown').querySelector('.dropdown-toggle');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  // ─── 일괄 가격 적용 기능 ───
  function setupBatchPricing() {
    // 최소이용금액의 판매금액 입력 시 일괄 모드에서 모든 요일에 반영
    var minSection = findSectionByTitle('최소이용금액');
    if (!minSection) return;
    var priceInput = minSection.querySelector('.document-price input');
    if (!priceInput) return;

    priceInput.addEventListener('input', function () {
      if (formState.pricingMode === 'batch') {
        var batchPrice = priceInput.value;
        var daySection = findSectionByTitle('기본 판매정책');
        if (daySection) {
          daySection.querySelectorAll('tbody tr .document-price input').forEach(function (inp) {
            inp.value = batchPrice;
          });
        }
        recalcAllSettlements();
      }
    });
  }

  // ─── 입력 필드 플레이스홀더 및 기본값 설정 ───
  function setupInputPlaceholdersAndDefaults() {
    // 기본 판매정책 섹션
    var daySection = findSectionByTitle('기본 판매정책');
    if (daySection) {
      daySection.querySelectorAll('tbody tr').forEach(function (row) {
        var priceInput = row.querySelector('.document-price input');
        var settlementInput = row.querySelector('.document-settlementAmount input');
        var stockInput = row.querySelector('.document-maxStock input');

        if (priceInput) {
          priceInput.setAttribute('placeholder', '0');
          if (!priceInput.value) priceInput.value = '0';
        }
        if (settlementInput) {
          settlementInput.setAttribute('placeholder', '0');
          if (!settlementInput.value) settlementInput.value = '0';
        }
        if (stockInput) {
          stockInput.setAttribute('placeholder', '0');
          if (!stockInput.value) stockInput.value = '0';
        }
      });
    }

    // 공휴일 판매정책 섹션
    var holidaySection = findSectionByTitle('공휴일 판매정책');
    if (holidaySection) {
      var hPriceInput = holidaySection.querySelector('.document-price input');
      var hSettlementInput = holidaySection.querySelector('.document-settlementAmount input');
      var hStockInput = holidaySection.querySelector('.document-maxStock input');

      if (hPriceInput) {
        hPriceInput.setAttribute('placeholder', '0');
        if (!hPriceInput.value) hPriceInput.value = '0';
      }
      if (hSettlementInput) {
        hSettlementInput.setAttribute('placeholder', '0');
        if (!hSettlementInput.value) hSettlementInput.value = '0';
      }
      if (hStockInput) {
        hStockInput.setAttribute('placeholder', '0');
        if (!hStockInput.value) hStockInput.value = '0';
      }
    }

    // 최소이용금액 섹션
    var minSection = findSectionByTitle('최소이용금액');
    if (minSection) {
      var minPriceInput = minSection.querySelector('.document-price input');
      var minSettlementInput = minSection.querySelector('.document-settlementAmount input');

      if (minPriceInput) {
        minPriceInput.setAttribute('placeholder', '0');
      }
      if (minSettlementInput) {
        minSettlementInput.setAttribute('placeholder', '0');
      }
    }

    // 옵션 가격정책 섹션
    var optionSection = findSectionByTitle('옵션 가격정책');
    if (optionSection) {
      optionSection.querySelectorAll('tbody tr').forEach(function (row) {
        var priceInput = row.querySelector('.document-price input');
        var settlementInput = row.querySelector('.document-settlementAmount input');

        if (priceInput) {
          priceInput.setAttribute('placeholder', '0');
        }
        if (settlementInput) {
          settlementInput.setAttribute('placeholder', '0');
        }
      });
    }
  }

  // ─── 예매 가능 마감 설정 ───
  var DEADLINE_UNIT_KR = { hour: '시간', day: '일' };
  var DEADLINE_LARGE_THRESHOLD = { hour: 720, day: 365 };

  function isNonNegativeInteger(str) {
    if (str === '') return false;
    return /^(0|[1-9]\d*)$/.test(str);
  }

  function validateDeadlineValue() {
    var val = formState.deadlineValue.trim();
    var unitKr = DEADLINE_UNIT_KR[formState.deadlineUnit];
    if (val === '') {
      return { valid: false, error: '예매 마감 ' + unitKr + '을(를) 입력해 주세요.' };
    }
    if (!isNonNegativeInteger(val)) {
      return { valid: false, error: '0 이상의 정수만 입력할 수 있습니다.' };
    }
    var numVal = parseInt(val, 10);
    var warning = null;
    if (numVal > DEADLINE_LARGE_THRESHOLD[formState.deadlineUnit]) {
      warning = '입력값이 매우 큽니다. 설정이 맞는지 다시 확인해 주세요.';
    }
    return { valid: true, numVal: numVal, warning: warning };
  }

  function renderDeadlineSummary() {
    var area = document.getElementById('deadlineSummaryArea');
    var summaryRow = document.getElementById('deadlineSummaryRow');
    if (!area) return;
    var result = validateDeadlineValue();
    if (!result.valid) {
      area.innerHTML = '';
      if (summaryRow) summaryRow.style.display = 'none';
      return;
    }
    if (summaryRow) summaryRow.style.display = '';

    var unitKr = DEADLINE_UNIT_KR[formState.deadlineUnit];
    var txt = result.numVal === 0
      ? '이용시작 직전까지 예매 가능'
      : '이용시작일시 기준 ' + result.numVal + unitKr + ' 전';

    var html = '<div class="deadline-summary deadline-summary--info">' +
      '<svg class="deadline-summary-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3M8 10v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '<span>예매 마감: <strong>' + txt + '</strong></span></div>';

    if (result.warning) {
      html += '<div class="deadline-summary deadline-summary--warning" style="margin-top:8px;">' +
        '<svg class="deadline-summary-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 14h14L8 1z" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M8 6v4M8 11.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' +
        '<span>' + result.warning + '</span></div>';
    }
    area.innerHTML = html;
  }

  function renderDeadlineError() {
    var errEl = document.getElementById('deadlineError');
    var errMsg = document.getElementById('deadlineErrorMsg');
    var input = document.getElementById('deadlineValueInput');
    if (!errEl || !input) return;

    var result = validateDeadlineValue();
    if (result.valid) {
      errEl.style.display = 'none';
      input.classList.remove('is-invalid');
    } else {
      errEl.style.display = 'flex';
      errMsg.textContent = result.error;
      input.classList.add('is-invalid');
    }
  }

  function updateDeadlineHelperText() {
    var helper = document.getElementById('deadlineHelper');
    if (!helper) return;
    var u = DEADLINE_UNIT_KR[formState.deadlineUnit];
    helper.innerHTML = '0 이상의 정수를 입력하세요.<br>' +
      '예) 0 = 이용시작 직전까지 예매 가능 · 10 = 이용시작 10' + u + ' 전까지 예매 가능';
  }

  var deadlineInputDirty = false;

  function setupDeadlineSection() {
    var segment = document.getElementById('deadlineUnitSegment');
    var input = document.getElementById('deadlineValueInput');
    var unitLabel = document.getElementById('deadlineUnitLabel');
    if (!segment || !input) { console.warn('[Deadline] section elements not found'); return; }

    segment.addEventListener('click', function (e) {
      var btn = e.target.closest('.deadline-segment__btn');
      if (!btn) return;
      var newUnit = btn.getAttribute('data-unit');
      if (newUnit === formState.deadlineUnit) return;

      formState.deadlineUnit = newUnit;
      segment.querySelectorAll('.deadline-segment__btn').forEach(function (b) {
        b.classList.remove('deadline-segment__btn--active');
      });
      btn.classList.add('deadline-segment__btn--active');
      unitLabel.textContent = DEADLINE_UNIT_KR[newUnit] + ' 전까지';
      updateDeadlineHelperText();

      if (deadlineInputDirty) renderDeadlineError();
      renderDeadlineSummary();
      updatePayloadPreview();
    });

    input.addEventListener('input', function () {
      formState.deadlineValue = input.value;
      deadlineInputDirty = true;
      renderDeadlineError();
      renderDeadlineSummary();
      updatePayloadPreview();
    });

    input.addEventListener('blur', function () {
      deadlineInputDirty = true;
      renderDeadlineError();
      renderDeadlineSummary();
    });

    updateDeadlineHelperText();
    console.log('[Deadline] section initialized');
  }

  function showAdminToast(message, type) {
    var container = document.getElementById('adminToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'adminToastContainer';
      container.className = 'admin-toast-container';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'admin-toast admin-toast--' + (type || 'success');
    var icon = type === 'error'
      ? '<span class="deadline-error-icon" style="font-size:10px;">!</span>'
      : '<span style="color:#22c55e;font-size:16px;">&#10003;</span>';
    toast.innerHTML = icon + '<span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('admin-toast--out');
      setTimeout(function () { toast.remove(); }, 260);
    }, 3000);
  }

  // ─── 초기화 ───
  function init() {
    // 스피너 숨기기
    var spinner = document.querySelector('.spinner');
    if (spinner) spinner.style.display = 'none';

    // 모든 드롭다운 설정
    $$('.dropdown-toggle').forEach(setupDropdown);

    // 모든 스위치 설정
    $$('.custom-switch .custom-control-input').forEach(setupSwitch);

    // 기능별 설정
    setupCheckboxGroup();
    setupPurchasePeriodModeToggle();
    setupDInputs();
    setupAirportDropdown();
    setupProductTypeDropdown();
    setupPricingModeToggle();
    setupSettlementRatio();
    setupPriceInputs();
    setupBasicInputs();
    setupFormSubmit();
    setupBatchPricing();
    setupDeadlineSection();

    // 입력 필드 플레이스홀더 및 기본값 설정
    setupInputPlaceholdersAndDefaults();

    // 글로벌 이벤트
    setupGlobalClickHandler();

    // Payload 프리뷰 패널
    createPayloadPreviewPanel();

    // 모든 공통 섹션 표시
    showAllCommonSections();

    // 디버그: 초기화 상태 출력
    var foundSections = $$('.section--title').map(function (el) { return el.textContent.trim(); });
    console.log('[Admin Form] Found sections:', foundSections);
    console.log('[Admin Form] Dropdowns:', $$('.dropdown-toggle').length);
    console.log('[Admin Form] Switches:', $$('.custom-switch .custom-control-input').length);
    console.log('[Admin Form] Standalone mode initialized');
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
