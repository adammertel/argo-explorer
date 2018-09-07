import React from 'react'
import { observer } from 'mobx-react'

type Props = {
  stores: Array<Object>
}

class PanelContainer extends React.Component<Props> {
  props
  constructor(props: any) {
    super(props)
  }

  render() {
    return <div className="container panel-container" />
  }
}

export default observer(PanelContainer)
