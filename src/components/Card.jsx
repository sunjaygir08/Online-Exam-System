import React from 'react';
import { cn } from '../lib/utils.js';

export const Card = ({ children, className, title, subtitle, footer }) => {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden', className)}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-bottom border-slate-100">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="px-6 py-4 bg-slate-50 border-top border-slate-100">{footer}</div>}
    </div>
  );
};
