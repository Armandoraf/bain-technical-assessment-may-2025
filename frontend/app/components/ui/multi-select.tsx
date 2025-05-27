import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '~/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList
} from './command';
import { Badge } from './badge';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  placeholder?: React.ReactNode;
  value: string[];
  onChange: (v: string[]) => void;
  options: MultiSelectOption[];
  maxTags?: number;
  showCount?: boolean;
  disabled?: boolean;
}

export function MultiSelect({
  placeholder = 'Select…',
  value,
  onChange,
  options,
  disabled = false,
  showCount = true
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  const toggleAll = () =>
    onChange(value.length === options.length ? [] : options.map(o => o.value));

  const hasValue = value.length > 0;

  const Checkbox = ({ checked }: { checked: boolean }) => (
    <span
      className={cn(
        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
        checked ? 'border-slate-700' : 'border-gray-300'
      )}
    >
      <Check className={cn('h-3 w-3', checked ? 'opacity-100' : 'opacity-0')} />
    </span>
  );

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={disabled ? undefined : setOpen}
    >
      <PopoverTrigger asChild disabled={disabled}>
        <div className="relative inline-block">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open && !disabled}
            disabled={disabled}
            className={cn(
              'w-16 justify-between transition-opacity',
              hasValue && 'bg-slate-700 text-white',
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            )}
          >
            <span className="flex items-center gap-1">{placeholder}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0',
                hasValue ? 'opacity-100 text-white' : 'opacity-60'
              )}
            />
          </Button>

          {showCount && hasValue && (
            <Badge
              aria-label={`${value.length} selected`}
              className="absolute top-0.5 -right-0.5 h-5 w-5 translate-x-1/2 -translate-y-1/2 
                         rounded-full p-0 text-[10px] font-medium leading-none
                         flex items-center justify-center"
            >
              {value.length}
            </Badge>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        hidden={disabled}
      >
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Options">
              <CommandItem
                value="__all__"
                onSelect={toggleAll}
                className={cn(
                  'cursor-pointer',
                  disabled && 'pointer-events-none'
                )}
              >
                <Checkbox checked={value.length === options.length} />
                {value.length === options.length ? 'Clear all' : 'Select all'}
              </CommandItem>

              {options.map(o => {
                const isChecked = value.includes(o.value);
                return (
                  <CommandItem
                    key={o.value}
                    value={o.value}
                    onSelect={() => toggle(o.value)}
                    className={cn(
                      'cursor-pointer',
                      disabled && 'pointer-events-none'
                    )}
                  >
                    <Checkbox checked={isChecked} />
                    {o.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
