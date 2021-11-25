import { Fragment, useState, useEffect, useContext } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'

import { SheetContext } from '../contexts/SheetContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Select({ title, variant="", sheet, sheetChange, titleClassNames="", extraClassNames }) {

  const [selected, setSelected] = useState(sheet)
  
  const { sheets } = useContext(SheetContext)  
  
  useEffect(() => {
    if ((sheet === undefined || sheet === null) && sheets.length > 0) {
        setSelected(sheets[0])
    } else if (sheet !== undefined) {
        setSelected(sheet)
    }
  }, [sheet, sheets])

  const onChange = (value) => {
    setSelected(value)
    sheetChange(value)
  }

  return (
      <>
        {selected !== null && selected !== undefined && <Listbox value={selected} onChange={onChange}>
            {({ open }) => (
                <>
                <div className={`relative ${variant !== 'right' ? 'w-48' : 'w-full rounded border border-gray-300'}`}>
                    <div className={`inline-flex shadow-sm rounded-md ${variant !== 'right' ? 'w-48' : 'w-full'}`}>
                        <div className={`relative z-0 inline-flex shadow-sm rounded-md ${variant !== 'topLeft' ? (variant === 'right' ? 'justify-between w-full h-10' : 'h-12') : 'w-48'}`}>
                            <div className={`relative flex items-center pr-4 border border-transparent rounded-l-md shadow-sm ${variant === 'bottomRight' ? 'bg-gray-900 text-gray-300' : (variant === 'right' ? 'bg-white text-black pl-3 w-full' : 'bg-white text-black')}`}>
                                <p className={`${titleClassNames} ${variant === 'right' ? 'w-full text-sm font-normal text-gray-500' : 'text-md font-medium'}`}>{!title ? (!sheet ? selected.title : sheet.title) : title}</p>
                            </div>
                            <Listbox.Button className={`relative inline-flex items-center px-2 rounded-l-none rounded-r-md text-sm font-medium focus:outline-none focus:z-10 ${variant === 'bottomRight' ? 'bg-gray-900 text-gray-300' : 'bg-white text-black'}`}>
                                <span className="sr-only">Change Sheet</span>
                                {!open && <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />}
                                {open && <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />}
                            </Listbox.Button>
                        </div>
                    </div>

                    <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options
                            static
                            className={`absolute z-40 mt-2 ${variant === 'right' ? 'w-full' : 'w-48'} h-60 overflow-y-scroll shadow-lg overflow-hidden bg-white divide-y divide-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none ${extraClassNames}`}
                        >
                            {sheets.map((option) => (
                                <Listbox.Option
                                    key={option.title}
                                    className={({ active }) =>
                                        classNames(
                                            active ? 'text-black' : 'text-gray-900',
                                            'cursor-default select-none relative px-4 py-2 text-sm'
                                        )
                                    }
                                    value={option}
                                >
                                    {({ selected, active }) => (
                                        <div className="flex flex-col">
                                            <div className="flex justify-between">
                                                <p className={selected ? 'font-semibold' : 'font-normal'}>{option.title}</p>
                                                {selected ? (
                                                    <span className={active ? 'text-black' : 'text-indigo-500'}>
                                                        {sheet !== undefined && sheet !== null && <CheckIcon className="h-5 w-5" aria-hidden="true" />}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className={classNames(active ? 'text-indigo-200' : 'text-gray-500', 'mt-1')}>
                                                {option.description}
                                            </p>
                                        </div>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
                </>
            )}
        </Listbox>}
    </>
  )
}
