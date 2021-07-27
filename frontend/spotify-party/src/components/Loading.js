import React from 'react'
import ReactLoading from 'react-loading';

import { theme } from '../styles/globals';

function Loading() {
    return (
        <div className="loading-screen">
            <ReactLoading className="loading-circle" type={"spin"} color={theme.greenColor} ></ReactLoading>
        </div>
    )
}

export default Loading
