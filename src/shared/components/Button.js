import React from 'react';

import { styles } from './Button.tailwind';

const Button = (
    {
        onClick,
        innerText,
        color="white",
        title="",
        variant="basic",
        disabled=false,
        type="button",
        extraClassNames="",
        children
    }
) => {
    const variantEnums = Object.keys(styles);

    let _variant = variant;
    if (!variantEnums.includes(_variant)) _variant = "basic";

    let buttonStyles = '';
    if (_variant === "basic") {
        const colorStyles = styles.basic[color] ? styles.basic[color] : styles.basic["green"];
        buttonStyles = `${colorStyles} p-3 text-md text-white`;
    }
    if (_variant === "modal") {
        const colorStyles = styles.modal[color] ? styles.modal[color] : styles.modal["blue"];
        buttonStyles = `${colorStyles} inline-flex justify-center p-4 text-md font-medium border border-transparent disabled:cursor-default disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`;
    }
    if (_variant === "outline") {
        const colorStyles = styles.outline[color] ? styles.outline[color] : styles.outline["white"];
        buttonStyles = `${colorStyles} h-10 border border-gray-300 px-4 text-sm font-semibold text-blue-700`;
    }

    return (
    <button
        className={`${buttonStyles} ${extraClassNames}`}
        type={type}
        disabled={disabled}
        onClick={onClick}
        title={title}
    >
        {children}
        {innerText}
    </button>
    );
};

export default Button;
