import React, { useState } from 'react'
import { UPDATE_BIRTHYEAR } from '../queries'
import { useMutation } from '@apollo/client'

const SetBirthyear = (props) => {
    const [ name, setName ] = useState(props.authors[0].name)
    const [ born, setBorn ] = useState('')

    const [ changeBirthYear ] = useMutation(UPDATE_BIRTHYEAR)

    const submit = async (event) => {
        event.preventDefault()
        changeBirthYear({ variables: { name, born } })
        setName('')
        setBorn('')
    }

    const handleChange = (event) => {
        setName(event.target.value)
    }

    return (
        <div>
            <h2>Set birthyear</h2>
            <form onSubmit={submit}>
                <div>
                    name
                    <select value={name} onChange={handleChange}>
                        {props.authors.map(a =>
                            <option value={a.name}>{a.name}</option>
                            )}
                    </select>
                    {/* <input type='text' value={name} onChange={({target}) => setName(target.value)} /> */}
                </div>
                <div>
                    born
                    <input type='number' value={born} onChange={({target}) => setBorn(parseInt(target.value))} />
                </div>
                <button type='submit'>update author</button>
            </form>
        </div>
    )
}

export default SetBirthyear