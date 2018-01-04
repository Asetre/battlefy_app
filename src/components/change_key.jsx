import React from 'react'
import axios from 'axios'

export default function ChangeKey(props) {
    function handleApiKeyChange(e) {
        e.preventDefault()
        let newKey = e.target.key.value
        axios.post(`/change-api-key?key=${newKey}`)
        .then(res => {
            window.alert('key changed!')
            props.history.push('/')
        })
        .catch(err => {
            window.alert('unable to change the key, the current key either works or the new key is invalid')
        })
    }
    return(
        <div className="ChangeKey">
            <form action="#" onSubmit={handleApiKeyChange}>
                <input type="text" placeholder="New api key" name="key"/>
                <input type="submit" value="Change Key"/>
            </form>
        </div>
    )
}
