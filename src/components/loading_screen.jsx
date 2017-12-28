import React from 'react'

export default function LoadingScreen(props) {
    return(
        <div className="Loading">
            <h2>Loading</h2>
            <h3>{props.msg}</h3>
        </div>
    )
}
