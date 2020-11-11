import React from 'react';
import { useBarcode } from '@createnextapp/react-barcode';

const Barcode = props => {
    const { inputRef } = useBarcode({ value: props.value });

    return <img ref={inputRef} />;
}

export default Barcode;
