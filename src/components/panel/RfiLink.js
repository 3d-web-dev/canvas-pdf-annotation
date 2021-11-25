import React from 'react'
import { XIcon } from '@heroicons/react/solid'

import Select from '../../shared/components/Select'

export default function RfiLink({sheet, sheetChange}) {

    return (
        <>
            {
                sheet === null || sheet === undefined ?
                    <Select title="Choose link..." variant="right" sheet={sheet} sheetChange={sheetChange} />
                    : <>
                        <img src={sheet.sheet} className="w-88 h-auto" alt="sheet" />
                        <div className="flex justify-between mt-2">
                            <figcaption className="text-indigo-700 text-sm">{sheet.title}</figcaption>
                            <button onClick={() => sheetChange(null)}>
                                <XIcon className="h-4 w-4 inline mr-4 text-gray-500 hover:text-gray-400" aria-hidden="true" />
                            </button>
                        </div>
                    </>
            }
        </>
    )
}
