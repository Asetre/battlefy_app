import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

function ErrorScreen(props) {
    return(
        <div className="ErrorScreen">
            <Link to="/">Go back to safety</Link>
            <h2>{props.errorMsg}</h2>
        </div>
    )
}

function mapStateToProps(state) {
    return {
        errorMsg: state.errorMsg
    }
}

function mapDispatchToProps(dispatch) {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorScreen)
