import React, { Fragment, useState, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useDropzone } from 'react-dropzone'

import { PlusIcon, DesktopComputerIcon, XIcon } from '@heroicons/react/solid'
import PhotoOutlinedIcon from '@material-ui/icons/PhotoOutlined';
import VideoLibraryOutlinedIcon from '@material-ui/icons/VideoLibraryOutlined';
import { ReactComponent as DragIcon } from '../../assets/svgicons/65.svg'

function Dropzone() {
    const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
        noClick: true,
        noKeyboard: true,
    })

    const files = acceptedFiles.map(file => {
        let icon
        if (file.type.includes('png') || file.type.includes('jpeg')) {
            icon = <PhotoOutlinedIcon fontSize="large" className="mr-4 inline text-blue-400" />
        } else if (file.type === 'video/mp4') {
            icon = <VideoLibraryOutlinedIcon fontSize="large" className="mr-4 inline text-blue-400" />
        }
        return (
            <li key={file.path} className="flex items-center py-2">
                {icon}
                <div className="inline-flex flex-col justify-center items-baseline">
                    <span className="text-sm text-gray-700 font-bold">{file.name}</span>
                    <span className="text-sm text-gray-400">Upload complete</span>
                </div>
            </li>
        )
    })

    return (
        <>
            <div { ...getRootProps() } className={`px-4 w-full h-72 rounded-md border border-dashed border-black flex flex-col ${files.length === 0 ? 'justify-center items-center' : 'justify-start align-baseline'}`}>
                {files.length === 0 ?
                    <>
                        <DragIcon className="text-gray-400 w-10 h-10" />
                        <input { ...getInputProps() } />
                        <p className="text-center text-sm text-gray-400 font-semibold">Drag photos or mp4 videos here, or select an option below...</p>
                    </> :
                    <aside>
                        <ul className="divide-y divide-gray-200">{files}</ul>
                    </aside>
                }
            </div>

            <button className="my-4 w-full flex justify-center items-center" onClick={open}>
                <DesktopComputerIcon className="text-blue-500 w-6 h-6" />
                <span className="text-xs ml-2 text-blue-500 font-medium">FROM YOUR COMPUTER</span>
            </button>
        </>
    )
}

export default function  CameraElement({ setLabel, setFontSize }) {
    
    const [ showDialog, setShowDialog ] = useState(false)

    const cancelButtonRef = useRef(null)

    return (
        <div className="p-4 w-full divide-y divide-gray-300">

            {/* title */}
            <div className="mt-2">
                <label htmlFor="camera" className="text-sm inline-block text-gray-500 font-semibold mb-2">Title</label>
                <input
                    type="text"
                    id="camera"
                    className="shadow-sm h-10 block w-full sm:text-sm border-gray-300 rounded-md"
                    aria-describedby="description"
                    onChange={e => console.log(e)}
                />
            </div>

            {/* photos & videos */}
            <div className="mt-2 pt-4">
                <label htmlFor="camera" className="text-sm inline-block text-gray-500 font-semibold mb-2">Photos and Videos</label>
                <button
                    className={`flex flex-row text-center align-middle hover:shadow-md text-sm`}
                    onClick={() => { setShowDialog(true) }}
                >
                    <PlusIcon className="w-8 h-8 inline-block text-center align-middle text-blue-500 border rounded-md border-gray-300 p-1 hover:bg-gray-200" />
                    <span className="text-blue-500 text-sm my-auto ml-2">Add</span>
                </button>
            </div>

            {/* modal dialog */}
            <Transition.Root show={showDialog} as={Fragment}>
                <Dialog
                    as="div"
                    static
                    className="fixed z-30 inset-0 overflow-y-auto"
                    initialFocus={cancelButtonRef}
                    open={showDialog}
                    onClose={setShowDialog}
                >
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 text-center sm:block sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        </Transition.Child>

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-4 sm:align-middle sm:max-w-lg sm:w-full divide-y divide-gray-300">
                                <Dialog.Title as="h3" className="text-lg flex justify-between leading-6 px-6 py-4 font-medium text-gray-900">
                                    Upload Photos
                                    <button onClick={() => { setShowDialog(false) }}>
                                        <XIcon className="w-5 h-5 text-gray-300" />
                                    </button>
                                </Dialog.Title>

                                <div className="pt-5 px-6">
                                    <Dropzone />
                                </div>

                                <div className="py-2 px-6 text-right bg-gray-100">
                                    <button
                                        type="button"
                                        className="inline-flex justify-right rounded border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                        onClick={() => setShowDialog(false)}
                                    >
                                        Finish
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

        </div>
    )
}
