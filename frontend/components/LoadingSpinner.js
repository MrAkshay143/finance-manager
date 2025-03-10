export default function LoadingSpinner({ size = 'medium', color = 'blue', fullPage = false, message = 'Loading...' }) {
  // Size classes
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };
  
  // Color classes
  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600',
    gray: 'border-gray-600',
  };
  
  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  const spinnerColor = colorClasses[color] || colorClasses.blue;
  
  // Full page spinner
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 flex flex-col items-center justify-center z-50">
        <div className={`${spinnerSize} border-t-transparent rounded-full animate-spin ${spinnerColor}`}></div>
        {message && <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>}
      </div>
    );
  }
  
  // Inline spinner
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className={`${spinnerSize} border-t-transparent rounded-full animate-spin ${spinnerColor}`}></div>
      {message && <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{message}</p>}
    </div>
  );
} 