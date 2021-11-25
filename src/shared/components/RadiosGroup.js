import React, { useState, useEffect } from 'react'
import { RadioGroup } from '@headlessui/react'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function RadiosGroup({ linkTypes, onChange }) {

    const [ selected, setSelected ] = useState()

    useEffect(() => {
        if (linkTypes !== undefined) {
            setSelected(linkTypes[0])
        }
    }, [linkTypes])

    return (
        <RadioGroup value={selected} onChange={(e) => { setSelected(e); onChange(e) }}>
            <RadioGroup.Label className="text-sm text-gray-500 font-semibold">Link type</RadioGroup.Label>
            <div className="bg-transparent rounded-md -space-y-px mt-2">
                {linkTypes.map((type, index) => (
                    <RadioGroup.Option
                        key={index}
                        value={type}
                        className="relative py-1 flex cursor-pointer focus:outline-none"
                    >
                        {({ checked }) => (
                            <>
                                <span
                                    className={classNames(
                                        checked ? 'bg-white border-indigo-600' : 'bg-white border-gray-300',
                                        'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center'
                                    )}
                                    aria-hidden="true"
                                >
                                    <span className={classNames(
                                        checked ? 'bg-indigo-600 w-2.5 h-2.5' : 'bg-white',
                                        'rounded-full',
                                    )}
                                    />
                                </span>
                                <div className="ml-3 flex flex-col">
                                    <RadioGroup.Label
                                        as="span"
                                        className={classNames(checked ? 'text-gray-900' : 'text-gray-500', 'block text-sm')}
                                    >
                                        {type}
                                    </RadioGroup.Label>
                                </div>
                            </>
                        )}
                    </RadioGroup.Option>
                ))}
            </div>
        </RadioGroup>
    )
}
