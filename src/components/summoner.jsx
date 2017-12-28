import React from 'react'

export default function Summoner(props) {
    return(
        <div className="Summoner">
            <h2>{props.name}</h2>
            <h2>{props.region}</h2>
            <h2>{props.level}</h2>
        </div>
    )
}
