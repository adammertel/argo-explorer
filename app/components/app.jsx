import React from 'react'
import { observer, action } from 'mobx-react'
import Base from './../base'

export default class App extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div>
        <a className='button is-primary'>dummy button test</a>
      </div>
    )
  }
}
