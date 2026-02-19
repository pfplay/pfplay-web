import { PFChevronRight } from '@/shared/ui/icons';

export type RadioSelectListItem<T> = { value: T; label: string };

type RadioSelectListProps<T> = {
  items: RadioSelectListItem<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

export function RadioSelectList<T>({ items, value, onChange }: RadioSelectListProps<T>) {
  return (
    <div className='border-t border-gray-700 max-h-[320px] overflow-y-auto'>
      {items.map((item, index) => (
        <label
          key={index}
          className='flex items-center gap-3 py-[14px] border-b border-gray-700 cursor-pointer'
          onClick={() => onChange(item.value)}
        >
          <div
            className='flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors border-gray-500 data-[checked=true]:border-red-400 data-[checked=true]:bg-red-400'
            data-checked={item.value === value}
          >
            {item.value === value && <div className='w-2 h-2 rounded-full bg-white' />}
          </div>
          <span className='flex-1 text-gray-50 text-sm'>{item.label}</span>
          <PFChevronRight width={20} height={20} className='text-gray-400' />
        </label>
      ))}
    </div>
  );
}
