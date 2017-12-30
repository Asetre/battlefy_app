import React from 'react'
import {connect} from 'react-redux'

default function ErrorScreen(props) {
    return(
        <h1>Error screen</h1>
    )
}

function mapStateToProps(state) {
    return {
    }
}

function mapDispatchToProps(dispatch) {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorScreen)
