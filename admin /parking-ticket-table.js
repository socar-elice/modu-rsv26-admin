// ============================================================
// parking-ticket-table.js
// 공통 주차권 목록 테이블 컴포넌트
// 사용처: 340_결제주차권관리, 350_캘린더(월간수요)
// 의존성: React 18 (전역), @babel/standalone
// ============================================================

(function () {
    'use strict';

    // ────────────────────────────────────────────────────────
    // ParkingTicketTable
    // 컬럼 정의(columns)를 받아 데이터 테이블을 렌더링하는 공통 컴포넌트
    //
    // Props:
    //   columns        - [{ key, header, render?, className?, headerStyle? }]
    //   data           - 표시할 데이터 배열
    //   onRowClick     - (item) => void  (선택)
    //   tableClassName - 테이블 CSS 클래스 (기본: 'data-table')
    //   emptyMessage   - 빈 상태 메시지 (기본: '검색 결과가 없습니다.')
    //   emptyIcon      - 빈 상태 아이콘 (선택)
    //   emptyClassName - 빈 상태 래퍼 CSS 클래스 (기본: 'empty-state')
    // ────────────────────────────────────────────────────────
    function ParkingTicketTable({
        columns,
        data,
        onRowClick,
        tableClassName = 'data-table',
        emptyMessage = '검색 결과가 없습니다.',
        emptyIcon,
        emptyClassName = 'empty-state'
    }) {
        return (
            <table className={tableClassName}>
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th key={col.key || i} style={col.headerStyle}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length}>
                                <div className={emptyClassName}>
                                    {emptyIcon && <div className={`${emptyClassName}-icon`}>{emptyIcon}</div>}
                                    <p>{emptyMessage}</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((item, idx) => (
                            <tr key={item.id || idx} onClick={onRowClick ? () => onRowClick(item) : undefined}>
                                {columns.map((col, colIdx) => (
                                    <td key={col.key || colIdx} className={col.className}>
                                        {col.render ? col.render(item) : item[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        );
    }

    // ────────────────────────────────────────────────────────
    // Pagination
    // 페이지네이션 컨트롤 공통 컴포넌트
    //
    // Props:
    //   currentPage  - 현재 페이지 번호
    //   totalPages   - 전체 페이지 수
    //   onPageChange - (pageNumber) => void
    // ────────────────────────────────────────────────────────
    function Pagination({ currentPage, totalPages, onPageChange }) {
        if (totalPages <= 1) return null;

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);
        const pages = [];
        for (let i = startPage; i <= endPage; i++) pages.push(i);

        return (
            <div className="pagination-wrapper">
                <button className="page-btn" disabled={currentPage <= 1} onClick={() => onPageChange(1)}>«</button>
                <button className="page-btn" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>‹</button>
                {pages.map(p => (
                    <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`}
                        onClick={() => onPageChange(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>›</button>
                <button className="page-btn" disabled={currentPage >= totalPages} onClick={() => onPageChange(totalPages)}>»</button>
            </div>
        );
    }

    // Export
    window.ParkingTicketTable = ParkingTicketTable;
    window.Pagination = Pagination;
})();
