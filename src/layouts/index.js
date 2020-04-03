import React from 'react'
import {AuthProvider} from '../pages/Context'

export default class extends React.Component {
    render (){
        return (
            <AuthProvider>
                { this.props.children }
            </AuthProvider>
        )

    }
}