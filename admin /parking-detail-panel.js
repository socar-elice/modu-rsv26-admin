// ============================================================
// parking-detail-panel.js
// 공통 상세 패널 인프라 (유틸 · 상수 · React 컴포넌트)
// 사용처: 340_주차관리, 350_캘린더뷰
// 의존성: React 18 (전역)
// 주의: JSX 미사용 — React.createElement 기반 (일반 script로 로드 가능)
// ============================================================

(function () {
    'use strict';

    var h = React.createElement;
    var useState = React.useState;
    var useEffect = React.useEffect;

    // ============================================================
    // Formatters / Utils
    // ============================================================
    function formatNullable(value, fallback) {
        if (value === null || value === undefined || value === '') return fallback || '-';
        return value;
    }

    function shouldRenderField(value) {
        return value !== null && value !== undefined && value !== '';
    }

    function shouldRenderSection(fields) {
        return fields.some(function (f) { return shouldRenderField(f); });
    }

    function formatDateOnly(dt) {
        if (!dt) return '-';
        return dt.split(' ')[0] || '-';
    }

    function formatTimeOnly(dt) {
        if (!dt) return '';
        return dt.split(' ')[1] || '';
    }

    function getProductTypeClass(type) {
        switch (type) {
            case '정기권': return 'pass';
            case '일반공유': return 'share';
            case '거주자공유': return 'resident';
            case '단기권': return 'short';
            default: return '';
        }
    }

    function getEntryStatusClass(status) {
        switch (status) {
            case '이용대기': return 'waiting';
            case '이용가능': return 'available';
            case '이용중': return 'active';
            case '이용종료': return 'done';
            default: return '';
        }
    }

    function getPaymentStatusClass(status) {
        switch (status) {
            case '결제완료': return 'completed';
            case '결제취소': return 'cancelled';
            default: return '';
        }
    }

    // ============================================================
    // Routing
    // ============================================================
    function goToPayment(paymentId) {
        console.log('[Navigate] 결제상세 →', paymentId);
        window.location.hash = '#/payment/' + paymentId;
    }

    function goToParkinglot(parkinglotId) {
        console.log('[Navigate] 주차장상세 →', parkinglotId);
        window.location.hash = '#/parkinglot/' + parkinglotId;
    }

    function goToUser(userId) {
        console.log('[Navigate] 회원상세 →', userId);
        window.location.hash = '#/user/' + userId;
    }

    // ============================================================
    // Types / Constants
    // ============================================================
    var ProductType = Object.freeze({
        GENERAL_TICKET:      'GENERAL_TICKET',
        GENERAL_SHARE:       'GENERAL_SHARE',
        RESIDENT_SHARE:      'RESIDENT_SHARE',
        SUBSCRIPTION_TICKET: 'SUBSCRIPTION_TICKET',
        SHORT_TERM_TICKET:   'SHORT_TERM_TICKET',
    });

    var ProductTypeLabel = Object.freeze({
        [ProductType.GENERAL_TICKET]:      '일반권',
        [ProductType.GENERAL_SHARE]:       '일반공유',
        [ProductType.RESIDENT_SHARE]:      '거주자공유',
        [ProductType.SUBSCRIPTION_TICKET]: '정기권',
        [ProductType.SHORT_TERM_TICKET]:   '단기권',
    });

    var KoreanToProductType = Object.freeze({
        '일반권':     ProductType.GENERAL_TICKET,
        '일반공유':   ProductType.GENERAL_SHARE,
        '거주자공유': ProductType.RESIDENT_SHARE,
        '정기권':     ProductType.SUBSCRIPTION_TICKET,
        '단기권':     ProductType.SHORT_TERM_TICKET,
    });

    var TICKET_BASED_TYPES = new Set([
        ProductType.GENERAL_TICKET,
        ProductType.SUBSCRIPTION_TICKET,
        ProductType.SHORT_TERM_TICKET,
    ]);

    var SectionId = Object.freeze({
        BASIC_INFO:          'basicInfo',
        USAGE_INFO:          'usageInfo',
        ENTRY_PROCESSING:    'entryProcessing',
        CUSTOMER_EXTRA_INFO: 'customerExtraInfo',
        TICKET_SUMMARY:      'ticketSummary',
    });

    var sectionConfigByProductType = Object.freeze({
        [ProductType.GENERAL_TICKET]: [
            { id: SectionId.BASIC_INFO },
            { id: SectionId.USAGE_INFO },
            { id: SectionId.ENTRY_PROCESSING },
            { id: SectionId.CUSTOMER_EXTRA_INFO, condition: 'hasAdditionalInfo' },
            { id: SectionId.TICKET_SUMMARY },
        ],
        [ProductType.GENERAL_SHARE]: [
            { id: SectionId.BASIC_INFO },
            { id: SectionId.USAGE_INFO },
            { id: SectionId.CUSTOMER_EXTRA_INFO, condition: 'hasAdditionalInfo' },
        ],
        [ProductType.RESIDENT_SHARE]: [
            { id: SectionId.BASIC_INFO },
            { id: SectionId.USAGE_INFO },
            { id: SectionId.CUSTOMER_EXTRA_INFO, condition: 'hasAdditionalInfo' },
        ],
        [ProductType.SUBSCRIPTION_TICKET]: [
            { id: SectionId.BASIC_INFO },
            { id: SectionId.USAGE_INFO },
            { id: SectionId.ENTRY_PROCESSING },
            { id: SectionId.CUSTOMER_EXTRA_INFO, condition: 'hasAdditionalInfo' },
            { id: SectionId.TICKET_SUMMARY },
        ],
        [ProductType.SHORT_TERM_TICKET]: [
            { id: SectionId.BASIC_INFO },
            { id: SectionId.USAGE_INFO },
            { id: SectionId.ENTRY_PROCESSING },
            { id: SectionId.CUSTOMER_EXTRA_INFO, condition: 'hasAdditionalInfo' },
            { id: SectionId.TICKET_SUMMARY },
        ],
    });

    function evaluateSectionCondition(config, detail) {
        if (!config.condition) return true;
        if (config.condition === 'hasAdditionalInfo') {
            return detail.additionalCustomerInfo != null;
        }
        return true;
    }

    var TICKET_SUMMARY_BY_TYPE = {
        '일반권': {
            ticketName: '일반 주차권', maxUsageCount: 1, exposureTime: '00:00 ~ 23:59',
            usageTime: '구매 시간 기준', availableDays: '월, 화, 수, 목, 금, 토, 일',
            notice: '해당 주차장의 운영시간 내에서만 이용 가능합니다.',
            preNotice: '주차장 만차 시 이용이 불가능할 수 있습니다.',
            postNotice: '출차 시 주차권 QR코드를 제시해 주세요.',
        },
        '정기권': {
            ticketName: '월정기 주차권', maxUsageCount: null, exposureTime: '00:00 ~ 23:59',
            usageTime: '00:00 ~ 23:59', availableDays: '월, 화, 수, 목, 금, 토, 일',
            notice: '월 정기권은 해당 월 내 무제한 입출차가 가능합니다.\n지정 주차장에서만 사용 가능합니다.',
            preNotice: '정기권 구매 후 취소 시 이용일수에 따라 환불 금액이 달라질 수 있습니다.',
            postNotice: '차량번호 자동 인식으로 입출차됩니다.',
        },
        '단기권': {
            ticketName: '단기 주차권', maxUsageCount: 1, exposureTime: '00:00 ~ 23:59',
            usageTime: '구매 시간 기준', availableDays: '월, 화, 수, 목, 금, 토, 일',
            notice: '단기 주차권은 지정된 시간 내에서만 이용 가능합니다.',
            preNotice: '항공편 변경 시 최소 24시간 전 알려주세요.',
            postNotice: '차량 수령 시 외관 상태를 반드시 확인해 주세요.',
        },
    };

    // ============================================================
    // SectionCard Component (아코디언)
    // ============================================================
    function SectionCard(props) {
        var title = props.title, subtitle = props.subtitle, collapsible = props.collapsible,
            defaultCollapsed = props.defaultCollapsed, headerRight = props.headerRight, children = props.children;
        var _s = useState(defaultCollapsed || false);
        var collapsed = _s[0], setCollapsed = _s[1];
        var cardClass = ['section-card', collapsible ? 'section-card--collapsible' : '', collapsed ? 'section-card--collapsed' : ''].filter(Boolean).join(' ');
        var chevronSvg = h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('polyline', { points: '6 9 12 15 18 9' }));
        var ChevronIcon = h('span', { className: 'section-card__toggle ' + (collapsed ? 'collapsed' : '') }, chevronSvg);
        return h('div', { className: cardClass },
            h('div', { className: 'section-card__header', onClick: collapsible ? function () { setCollapsed(function (p) { return !p; }); } : undefined },
                h('div', { className: 'section-card__header-left' }, h('h3', { className: 'section-card__title' }, title), subtitle && h('span', { className: 'section-card__subtitle' }, subtitle)),
                h('div', { className: 'section-card__header-right' }, !collapsed && headerRight, collapsible && ChevronIcon)
            ),
            h('div', { className: 'section-card__collapse ' + (collapsed ? 'collapsed' : '') }, h('div', { className: 'section-card__body' }, children))
        );
    }

    // ============================================================
    // Panel Sub-Sections
    // ============================================================

    function PanelBasicInfo(props) {
        var data = props.data;
        var parkinglotDisplay = data.sectionName ? data.parkingLotName + ' / ' + data.sectionName : data.parkingLotName;
        return h(SectionCard, { title: '기본 정보' },
            h('div', { className: 'detail-grid' },
                h('div', { className: 'detail-item' }, h('span', { className: 'detail-label' }, '결제번호'), h('span', { className: 'detail-value' }, h('button', { className: 'link-action', onClick: function () { goToPayment(data.paymentId); } }, data.paymentId))),
                h('div', { className: 'detail-item' }, h('span', { className: 'detail-label' }, '이용 서비스'), h('span', { className: 'detail-value', style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } }, h('span', { className: 'product-type-tag ' + getProductTypeClass(data.productType) }, data.productType), data.serviceName && h('span', null, data.serviceName), data.isWebDiscount && h('span', { className: 'parking-type-tag' }, '웹할인'))),
                h('div', { className: 'detail-item' }, h('span', { className: 'detail-label' }, '주차시작일시'), h('span', { className: 'detail-value' }, formatNullable(data.usagePeriodStart))),
                h('div', { className: 'detail-item' }, h('span', { className: 'detail-label' }, '주차종료일시'), h('span', { className: 'detail-value' }, formatNullable(data.usagePeriodEnd))),
                h('div', { className: 'detail-item full' }, h('span', { className: 'detail-label' }, '주차장 / 구획'), h('span', { className: 'detail-value' }, h('button', { className: 'link-action', onClick: function () { goToParkinglot(data.parkingLotId); } }, parkinglotDisplay))),
                h('div', { className: 'detail-item' }, h('span', { className: 'detail-label' }, '결제채널'), h('span', { className: 'detail-value' }, formatNullable(data.paymentChannel))),
                h('div', { className: 'detail-item' }, h('span', { className: 'detail-label' }, '이용상태'), h('span', { className: 'detail-value' }, h('span', { className: 'entry-status ' + getEntryStatusClass(data.usageStatus) }, data.usageStatus)))
            )
        );
    }

    function PanelUsageInfo(props) {
        var data = props.data;
        return h(SectionCard, { title: '이용정보' },
            h('div', { className: 'detail-grid' },
                h('div', { className: 'detail-item' }, h('span', { className: 'detail-label' }, '회원번호'), h('span', { className: 'detail-value' }, h('button', { className: 'link-action', onClick: function () { goToUser(data.userId); } }, data.userId))),
                h('div', { className: 'detail-item' }, h('span', { className: 'detail-label' }, '회원명'), h('span', { className: 'detail-value' }, formatNullable(data.buyerName))),
                h('div', { className: 'detail-item' }, h('span', { className: 'detail-label' }, '차량번호'), h('span', { className: 'detail-value', style: { fontWeight: 'var(--font-weight-bold)', letterSpacing: '0.5px' } }, data.vehicleNumber))
            )
        );
    }

    function PanelEntryProcessing(props) {
        var data = props.data, onToast = props.onToast;
        var _ed = useState(data.entryTime ? formatDateOnly(data.entryTime) : ''); var entryDate = _ed[0], setEntryDate = _ed[1];
        var _et = useState(data.entryTime ? formatTimeOnly(data.entryTime) : ''); var entryTimeVal = _et[0], setEntryTime = _et[1];
        var _im = useState(null); var inlineMsg = _im[0], setInlineMsg = _im[1];
        useEffect(function () { setEntryDate(data.entryTime ? formatDateOnly(data.entryTime) : ''); setEntryTime(data.entryTime ? formatTimeOnly(data.entryTime) : ''); setInlineMsg(null); }, [data.id]);
        useEffect(function () { if (!inlineMsg) return; var t = setTimeout(function () { setInlineMsg(null); }, 3000); return function () { clearTimeout(t); }; }, [inlineMsg]);
        var isFormValid = entryDate && entryTimeVal;
        var handleRegisterEntry = function () {
            if (!isFormValid) { setInlineMsg({ type: 'error', message: '입차 날짜와 시간을 모두 입력해 주세요.' }); return; }
            console.log('[입차 처리]', { entryDate: entryDate, entryTime: entryTimeVal });
            setInlineMsg({ type: 'success', message: '입차 처리 완료: ' + entryDate + ' ' + entryTimeVal });
        };
        var history = data.processingHistory || [];
        var emptyStateSvg = h('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, style: { opacity: 0.35 } },
            h('path', { d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2' }), h('rect', { x: 9, y: 3, width: 6, height: 4, rx: 1 }), h('line', { x1: 9, y1: 12, x2: 15, y2: 12 }), h('line', { x1: 9, y1: 16, x2: 13, y2: 16 }));
        var historyContent;
        if (history.length > 0) {
            historyContent = h('table', { className: 'history-table' },
                h('thead', null, h('tr', null, h('th', null, '처리번호'), h('th', null, '구분'), h('th', null, '처리내용'), h('th', null, '처리일시'), h('th', null, '담당자'))),
                h('tbody', null, history.map(function (r) { return h('tr', { key: r.id }, h('td', null, r.id), h('td', null, r.category), h('td', { style: { textAlign: 'left' } }, r.content), h('td', { style: { whiteSpace: 'nowrap' } }, formatNullable(r.processedAt)), h('td', null, r.handler)); }))
            );
        } else {
            historyContent = h('div', { className: 'empty-state--compact' }, h('div', { className: 'empty-state__icon' }, emptyStateSvg), h('div', { className: 'empty-state__title' }, '처리 이력 없음'), h('div', { className: 'empty-state__desc' }, '아직 등록된 처리 이력이 없습니다.'));
        }
        return h(SectionCard, { title: '입차 처리' },
            h('div', { className: 'entry-form' },
                h('div', { className: 'entry-form__group' }, h('span', { className: 'entry-form__label' }, '입차 날짜'), h('input', { type: 'date', className: 'entry-form__input', value: entryDate, onChange: function (e) { setEntryDate(e.target.value); } })),
                h('div', { className: 'entry-form__group' }, h('span', { className: 'entry-form__label' }, '입차 시간'), h('input', { type: 'time', className: 'entry-form__input', value: entryTimeVal, onChange: function (e) { setEntryTime(e.target.value); } })),
                h('button', { className: 'btn btn-primary entry-form__btn', style: { height: 34, fontSize: '12px', padding: '0 14px' }, onClick: handleRegisterEntry, disabled: !isFormValid }, '입차 등록')
            ),
            inlineMsg && h('div', { className: 'inline-toast ' + inlineMsg.type }, (inlineMsg.type === 'success' ? '✓' : '!') + ' ' + inlineMsg.message),
            h('div', { className: 'history-sub-header' }, '처리 이력'),
            historyContent
        );
    }

    function PanelCustomerExtraInfo(props) {
        var data = props.data, onSave = props.onSave, onToast = props.onToast;
        var info = data.additionalCustomerInfo;
        var _ie = useState(false); var isEditing = _ie[0], setIsEditing = _ie[1];
        var _ef = useState({ departureFlight: (info && info.departureFlight) || '', arrivalFlight: (info && info.arrivalFlight) || '', vehicleModel: (info && info.vehicleModel) || '' });
        var editForm = _ef[0], setEditForm = _ef[1];
        useEffect(function () { if (info) { setEditForm({ departureFlight: info.departureFlight || '', arrivalFlight: info.arrivalFlight || '', vehicleModel: info.vehicleModel || '' }); setIsEditing(false); } }, [data.id]);
        var handleChange = function (field, value) { setEditForm(function (prev) { var next = Object.assign({}, prev); next[field] = value; return next; }); };
        var handleSave = function () { console.log('[부가정보 저장]', editForm); if (onSave) onSave(data.id, editForm); if (onToast) onToast({ type: 'success', message: '고객 부가정보가 수정되었습니다.' }); setIsEditing(false); };
        var handleCancel = function () { setEditForm({ departureFlight: (info && info.departureFlight) || '', arrivalFlight: (info && info.arrivalFlight) || '', vehicleModel: (info && info.vehicleModel) || '' }); setIsEditing(false); };
        var editBtn = !isEditing ? h('button', { className: 'btn btn-outline', style: { padding: '3px 10px', fontSize: '11px' }, onClick: function (e) { e.stopPropagation(); setIsEditing(true); } }, '수정') : null;
        function renderField(label, fieldKey, placeholder) {
            return h('div', { className: 'detail-item' }, h('span', { className: 'detail-label' }, label),
                isEditing ? h('input', { className: 'detail-edit-input', value: editForm[fieldKey], onChange: function (e) { handleChange(fieldKey, e.target.value); }, placeholder: placeholder }) : h('span', { className: 'detail-value' }, formatNullable(info && info[fieldKey])));
        }
        return h(SectionCard, { title: '고객 입력 부가정보', collapsible: true, defaultCollapsed: true, headerRight: editBtn },
            h('div', { className: 'detail-grid' }, renderField('출국항공편', 'departureFlight', 'KE000'), renderField('입국항공편', 'arrivalFlight', 'KE000'), renderField('차종', 'vehicleModel', '차종 입력')),
            isEditing && h('div', { className: 'detail-actions', style: { marginTop: 16 } }, h('button', { className: 'btn btn-success', style: { padding: '6px 20px', fontSize: '13px' }, onClick: handleSave }, '저장'), h('button', { className: 'btn btn-outline', style: { padding: '6px 20px', fontSize: '13px' }, onClick: handleCancel }, '취소'))
        );
    }

    function PanelTicketSummary(props) {
        var data = props.data;
        var summary = data.ticketSummary;
        if (!summary) return null;
        var items = [
            { label: '주차권 이름', value: summary.ticketName },
            { label: '최대 이용 가능 수량', value: summary.maxUsageCount != null ? summary.maxUsageCount + '회' : '무제한' },
            { label: '노출시간', value: summary.exposureTime }, { label: '사용시간', value: summary.usageTime },
            { label: '사용가능요일', value: summary.availableDays }, { label: '안내사항', value: summary.notice },
            { label: '구매 전 유의사항', value: summary.preNotice }, { label: '구매 후 유의사항', value: summary.postNotice },
        ];
        return h(SectionCard, { title: '주차권 요약정보', collapsible: true, defaultCollapsed: true },
            h('ul', { className: 'summary-list' }, items.map(function (item) { return h('li', { key: item.label }, h('span', { className: 'summary-list__label' }, item.label), h('span', { className: 'summary-list__value' }, formatNullable(item.value))); }))
        );
    }

    var SECTION_COMPONENT_MAP = {};
    SECTION_COMPONENT_MAP[SectionId.BASIC_INFO] = PanelBasicInfo;
    SECTION_COMPONENT_MAP[SectionId.USAGE_INFO] = PanelUsageInfo;
    SECTION_COMPONENT_MAP[SectionId.ENTRY_PROCESSING] = PanelEntryProcessing;
    SECTION_COMPONENT_MAP[SectionId.CUSTOMER_EXTRA_INFO] = PanelCustomerExtraInfo;
    SECTION_COMPONENT_MAP[SectionId.TICKET_SUMMARY] = PanelTicketSummary;

    // ============================================================
    // DetailPanel — 통합 상세 패널 컨테이너
    // Props: item, enrichFn, onClose, onSave
    // ============================================================
    function DetailPanel(props) {
        var item = props.item, enrichFn = props.enrichFn, onClose = props.onClose, onSave = props.onSave;
        var _pt = useState(null); var panelToast = _pt[0], setPanelToast = _pt[1];
        useEffect(function () { if (!panelToast) return; var t = setTimeout(function () { setPanelToast(null); }, 3000); return function () { clearTimeout(t); }; }, [panelToast]);
        if (!item) return null;
        var detail = enrichFn(item);
        var enumType = detail._enumType;
        var sections = sectionConfigByProductType[enumType] || [];
        var closeSvg = h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }, h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }), h('line', { x1: 6, y1: 6, x2: 18, y2: 18 }));
        var sectionElements = sections.map(function (config) {
            if (!evaluateSectionCondition(config, detail)) return null;
            var Component = SECTION_COMPONENT_MAP[config.id];
            if (!Component) return null;
            return h(Component, { key: config.id, data: detail, onSave: onSave, onToast: setPanelToast });
        });
        var toastEl = panelToast && h('div', { style: { flexShrink: 0, padding: '10px 20px', background: panelToast.type === 'success' ? '#f0fdf4' : '#fef2f2', borderTop: '1px solid', borderColor: panelToast.type === 'success' ? '#bbf7d0' : '#fecaca', textAlign: 'center', fontSize: '13px', fontWeight: 500, color: panelToast.type === 'success' ? '#166534' : '#991b1b', animation: 'toastIn 300ms ease' } }, (panelToast.type === 'success' ? '✓ ' : '! ') + panelToast.message);
        return h(React.Fragment, null,
            h('div', { className: 'detail-overlay ' + (item ? 'open' : ''), onClick: onClose }),
            h('div', { className: 'detail-panel ' + (item ? 'open' : '') },
                h('div', { className: 'detail-panel-header' }, h('span', { className: 'detail-panel-title' }, '결제주차권 상세'), h('button', { className: 'detail-panel-close', onClick: onClose, title: '닫기' }, closeSvg)),
                h('div', { className: 'detail-panel-body' }, sectionElements),
                toastEl
            )
        );
    }

    // ============================================================
    // Export to window
    // ============================================================
    window.formatNullable = formatNullable;
    window.shouldRenderField = shouldRenderField;
    window.shouldRenderSection = shouldRenderSection;
    window.formatDateOnly = formatDateOnly;
    window.formatTimeOnly = formatTimeOnly;
    window.getProductTypeClass = getProductTypeClass;
    window.getEntryStatusClass = getEntryStatusClass;
    window.getPaymentStatusClass = getPaymentStatusClass;
    window.goToPayment = goToPayment;
    window.goToParkinglot = goToParkinglot;
    window.goToUser = goToUser;
    window.ProductType = ProductType;
    window.ProductTypeLabel = ProductTypeLabel;
    window.KoreanToProductType = KoreanToProductType;
    window.TICKET_BASED_TYPES = TICKET_BASED_TYPES;
    window.SectionId = SectionId;
    window.sectionConfigByProductType = sectionConfigByProductType;
    window.evaluateSectionCondition = evaluateSectionCondition;
    window.TICKET_SUMMARY_BY_TYPE = TICKET_SUMMARY_BY_TYPE;
    window.SectionCard = SectionCard;
    window.DetailPanel = DetailPanel;
})();
