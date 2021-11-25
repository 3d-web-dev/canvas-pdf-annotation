import React, { useState } from 'react'

import RadiosGroup from '../../shared/components/RadiosGroup'

import SheetLink from './SheetLink'
import DocumentLink from './DocumentLink'
import RfiLink from './RfiLink'

export default function LinkElement({ link, setLink, setLabel, setBorders, setNote }) {
    const [ type, setType ] = useState('Sheet')
    
    const typeChange = value => {
        setType(value)
        setLink(null)
    }

    return (
        <div className="p-4 w-full">

            {type === 'Sheet' && (link === null || link === undefined) && <RadiosGroup title="Link type" linkTypes={['Sheet', 'Document', 'RFI']} onChange={typeChange} />}
            {type === 'Document' && (link === null || link === undefined) && <RadiosGroup title="Link type" linkTypes={['Sheet', 'Document', 'RFI']} onChange={typeChange} />}
            {type === 'RFI' && (link === null || link === undefined) && <RadiosGroup title="Link type" linkTypes={['Sheet', 'Document', 'RFI']} onChange={typeChange} />}

            <div className="mt-2">
                <label className="text-md inline-block text-gray-500 font-semibold mb-2">Link</label>
                {type ==='Sheet' && <SheetLink sheet={link} sheetChange={setLink} />}
                {type ==='Document' && <DocumentLink sheet={link} sheetChange={setLink} />}
                {type ==='RFI' && <RfiLink sheet={link} sheetChange={setLink} />}
            </div>

            <div className="mt-6">
                <label htmlFor="description" className="text-md inline-block text-gray-500 font-semibold mb-2">Label</label>
                <input
                    type="text"
                    id="description"
                    className="shadow-sm h-10 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Description"
                    aria-describedby="description"
                    onChange={e => setLabel(e.target.value)}
                />
            </div>

            <div className="mt-6">
                <label className="text-md inline-block text-gray-500 font-semibold mb-2">Borders</label>
                <div className="flex items-center">
                    <input
                        id="borders"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-0"
                        onChange={e => setBorders(e.target.checked)}
                    />
                    <label htmlFor="borders" className="ml-2 block text-sm text-gray-600">Show Markup Borders</label>
                </div>
            </div>

            <div className="mt-6">
                <label htmlFor="note" className="text-md inline-block text-gray-500 font-semibold mb-2">Note</label>
                <input
                    type="text"
                    id="note"
                    className="shadow-sm h-10 block w-full sm:text-sm border-gray-300 rounded-md"
                    aria-describedby="description"
                    onChange={e => setNote(e.target.value)}
                />
            </div>

        </div>
    )
}
