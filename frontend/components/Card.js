'use client';

export default function Card({
  title,
  subtitle,
  children,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  icon,
  iconClassName = '',
  action,
  noPadding = false,
  bordered = true,
  shadow = true,
  rounded = true,
  onClick,
}) {
  const cardClasses = `
    ${className}
    ${bordered ? 'border border-gray-200' : ''}
    ${shadow ? 'shadow-sm' : ''}
    ${rounded ? 'rounded-xl' : ''}
    ${onClick ? 'cursor-pointer hover:border-gray-300 transition-colors' : ''}
    bg-white overflow-hidden
  `;
  
  const headerClasses = `
    ${headerClassName}
    ${title || subtitle || icon ? 'px-5 py-4 border-b border-gray-100' : ''}
    flex items-center justify-between
  `;
  
  const bodyClasses = `
    ${bodyClassName}
    ${noPadding ? '' : 'p-5'}
    flex-1
  `;
  
  const footerClasses = `
    ${footerClassName}
    ${footer ? 'px-5 py-3 border-t border-gray-100 bg-gray-50' : ''}
  `;
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || subtitle || icon || action) && (
        <div className={headerClasses}>
          <div className="flex items-center">
            {icon && (
              <div className={`mr-3 ${iconClassName}`}>
                {typeof icon === 'string' ? (
                  <i className={`fa-solid ${icon}`}></i>
                ) : (
                  icon
                )}
              </div>
            )}
            
            <div>
              {title && <h3 className="font-medium text-gray-800">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          
          {action && (
            <div className="ml-4">
              {action}
            </div>
          )}
        </div>
      )}
      
      <div className={bodyClasses}>
        {children}
      </div>
      
      {footer && (
        <div className={footerClasses}>
          {footer}
        </div>
      )}
    </div>
  );
} 