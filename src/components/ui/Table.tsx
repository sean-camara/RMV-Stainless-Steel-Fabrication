import React, { createContext, useContext } from 'react';

type TableVariant = 'dark' | 'light';

const TableVariantContext = createContext<TableVariant>('dark');
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  variant?: TableVariant;
}

export const Table: React.FC<TableProps> = ({ children, className = '', variant = 'dark' }) => {
  const borderClass = variant === 'light' ? 'border-slate-200' : 'border-slate-700';
  return (
    <TableVariantContext.Provider value={variant}>
      <div className={`overflow-x-auto rounded-lg border ${borderClass} ${className}`}>
        <table className="w-full text-left">{children}</table>
      </div>
    </TableVariantContext.Provider>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  const variant = useContext(TableVariantContext);
  const headerClass =
    variant === 'light'
      ? 'bg-slate-50 border-b border-slate-200'
      : 'bg-slate-700/50 border-b border-slate-700';
  return <thead className={headerClass}>{children}</thead>;
};

interface TableBodyProps {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  const variant = useContext(TableVariantContext);
  const divideClass = variant === 'light' ? 'divide-slate-100' : 'divide-slate-700';
  return <tbody className={`divide-y ${divideClass}`}>{children}</tbody>;
};

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({ children, onClick, className = '' }) => {
  const variant = useContext(TableVariantContext);
  const baseClass =
    variant === 'light'
      ? 'bg-white hover:bg-slate-50'
      : 'bg-slate-800 hover:bg-slate-700/50';
  return (
    <tr
      className={`${baseClass} transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableHeadProps {
  children?: React.ReactNode;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  className?: string;
}

export const TableHead: React.FC<TableHeadProps> = ({
  children,
  sortable = false,
  sortDirection = null,
  onSort,
  className = '',
}) => {
  const variant = useContext(TableVariantContext);
  const textClass = variant === 'light' ? 'text-slate-600' : 'text-slate-300';
  const hoverClass = sortable
    ? variant === 'light'
      ? 'cursor-pointer hover:text-slate-800 select-none'
      : 'cursor-pointer hover:text-white select-none'
    : '';

  return (
    <th
      className={`
        px-4 py-3 text-sm font-semibold uppercase tracking-wider
        ${textClass}
        ${hoverClass}
        ${className}
      `}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <span className={variant === 'light' ? 'text-slate-400' : 'text-slate-500'}>
            {sortDirection === 'asc' ? (
              <ChevronUp className="w-4 h-4" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronsUpDown className="w-4 h-4" />
            )}
          </span>
        )}
      </div>
    </th>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className = '', ...props }) => {
  const variant = useContext(TableVariantContext);
  const textClass = variant === 'light' ? 'text-slate-700' : 'text-slate-300';
  return <td className={`px-4 py-3 text-sm ${textClass} ${className}`} {...props}>{children}</td>;
};

// Empty state for tables
interface TableEmptyProps {
  message?: string;
  colSpan: number;
  icon?: React.ReactNode;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({
  message = 'No data available',
  colSpan,
  icon,
}) => {
  const variant = useContext(TableVariantContext);
  const textClass = variant === 'light' ? 'text-slate-500' : 'text-slate-400';
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <div className={`flex flex-col items-center ${textClass}`}>
          {icon && <div className="mb-3">{icon}</div>}
          <p>{message}</p>
        </div>
      </td>
    </tr>
  );
};

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const variant = useContext(TableVariantContext);
  const idleText = variant === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white';
  const activeBg = variant === 'light' ? 'bg-cyan-600 text-white' : 'bg-cyan-500 text-white';
  const hoverBg = variant === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700';

  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 text-sm ${idleText} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        Previous
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`px-3 py-1 text-sm rounded ${idleText} ${hoverBg}`}
          >
            1
          </button>
          {startPage > 2 && <span className="text-slate-500">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`
            px-3 py-1 text-sm rounded
            ${
              page === currentPage
                ? activeBg
                : `${idleText} ${hoverBg}`
            }
          `}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-slate-500">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`px-3 py-1 text-sm rounded ${idleText} ${hoverBg}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 text-sm ${idleText} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        Next
      </button>
    </div>
  );
};
