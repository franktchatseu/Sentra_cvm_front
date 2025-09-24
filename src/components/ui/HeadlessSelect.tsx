import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface HeadlessSelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  searchable?: boolean;
}

export default function HeadlessSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  error = false,
  className = "",
  searchable = false
}: HeadlessSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = searchable
    ? options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : options;

  return (
    <div className={`relative ${className}`}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className={`
            relative w-full cursor-default rounded-lg bg-white py-3 pl-4 pr-10 text-left shadow-sm border transition-all duration-200
            ${error
              ? 'border-red-300 focus:border-red-500'
              : 'border-gray-300 focus:outline-none'
            }
            ${disabled
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
              : 'hover:border-gray-400 focus:outline-none'
            }
          `}>
            <span className={`block ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {searchable && (
                <div className="px-3 py-2 border-b border-gray-200">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search options..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {filteredOptions.length === 0 ? (
                <div className="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-500">
                  No options found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={({ active, disabled }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 transition-colors duration-150 ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-900'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block ${selected ? 'font-medium' : 'font-normal'
                            }`}
                        >
                          {option.label}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3b8169]">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
