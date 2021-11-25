import React, { useState, useEffect, useContext } from 'react'

import Select from '../shared/components/Select'
import SVGButton from '../shared/components/SVGButton'

import { SheetContext } from '../shared/contexts/SheetContext'

import SVGPrev from '../assets/svgicons/62.svg'
import SVGNext from '../assets/svgicons/63.svg'

export default function BottomControls({ sheet, sheetChange, showPanel }) {

    const [ prevDisabled, setPrevDisabled ] = useState(false)
    const [ nextDisabled, setNextDisabled ] = useState(false)
    const [ currentSheet, setCurrentSheet ] = useState()

    const { sheets } = useContext(SheetContext)

    const sheetPrev = () => {
        let value
        if (sheet === undefined) {
            value = sheets.filter(item => item.id === (sheets.length - 1))[0];
        } else {
            value = sheets.filter(item => item.id === (sheet.id - 1))[0];
        }
        sheetChange(value)
    }

    const sheetNext = () => {
        let value
        if (sheet === undefined) {
            value = sheets.filter(item => item.id === 2)[0];
        } else {
            value = sheets.filter(item => item.id === (sheet.id + 1))[0];
        }
        sheetChange(value)
    }

    useEffect(() => {
        if ((sheet === undefined && sheets.length > 0) || (sheet !== undefined && sheet.id === 1)) {
            setPrevDisabled(true)
            setNextDisabled(false)
            setCurrentSheet(sheets[0])
        } else if (sheet !== undefined && sheet.id === sheets.length) {
            setPrevDisabled(false)
            setNextDisabled(true)
            setCurrentSheet(sheets[sheets.length - 1])
        } else {
            setPrevDisabled(false)
            setNextDisabled(false)
            setCurrentSheet(sheet)
        }
    }, [sheet, sheets])

    return (
        <section className="p-1 rounded absolute bottom-4 flex flex-row z-20" style={{right: `${showPanel ? '25rem' : '1rem'}`}}>
            <Select title="Jump to Sheet" variant="bottomRight" sheet={currentSheet} sheetChange={sheetChange} titleClassNames="px-4" extraClassNames="right-0 bottom-12" />

            <div className="bg-gray-900 rounded p-1 ml-4 flex flex-row">
                <SVGButton onClick={sheetPrev} svgIcon={SVGPrev} disabled={prevDisabled} extraClassNames="w-10 rounded mr-2" />
                <SVGButton onClick={sheetNext} svgIcon={SVGNext} disabled={nextDisabled} extraClassNames="w-10 rounded" />
            </div>
        </section>
    )
}
