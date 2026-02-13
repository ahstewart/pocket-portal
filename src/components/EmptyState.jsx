import { FolderOpenIcon } from '@heroicons/react/24/outline';
import Button from './Button';

export default function EmptyState({ 
  title = 'No models found',
  description = 'Try adjusting your filters or search terms',
  icon: Icon = FolderOpenIcon,
  action,
  className = '',
  ...props 
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`} {...props}>
      <div className="mb-4 p-3 bg-slate-100 rounded-full">
        <Icon className="h-8 w-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm mb-6 text-center max-w-xs">{description}</p>
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
