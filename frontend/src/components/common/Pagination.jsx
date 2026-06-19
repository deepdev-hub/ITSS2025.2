import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '10px 0' }}>
      <button 
        className="button button-secondary" 
        style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} /> Prev
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return <span key={`ellipsis-${index}`} style={{ padding: '0 8px', color: '#64748b' }}>...</span>;
          }
          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                border: isCurrent ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                background: isCurrent ? 'var(--primary)' : '#fff',
                color: isCurrent ? '#fff' : '#475569',
                fontWeight: isCurrent ? '600' : '500',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.background = '#f1f5f9';
                }
              }}
              onMouseOut={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.background = '#fff';
                }
              }}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button 
        className="button button-secondary"
        style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }} 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}
