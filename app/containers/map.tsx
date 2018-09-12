import React from 'react'
import { observer } from 'mobx-react'
import Base from './../helpers/base'
import MapComponent from './../components/map'
import map from './../components/map'
import { timeColor } from './../helpers/feature'
import L from 'leaflet'
import {
  Map,
  LayerGroup,
  TileLayer,
  WMSTileLayer,
  GeoJSON,
  Pane,
  CircleMarker,
  ScaleControl,
  AttributionControl,
  Marker,
  Popup,
  Tooltip
} from 'react-leaflet'
import 'leaflet.markercluster'

import 'leaflet.markercluster.placementstrategies'
import MarkerClusterGroup from 'react-leaflet-markercluster'

type Props = {
  stores: Array<Object>
}

@observer
export default class MapContainer extends React.Component<Props> {
  props

  constructor(props: any) {
    super(props)
  }

  handleViewportChange(newCenter, newZoom, newBounds) {
    const sw = newBounds.getSouthWest()
    const ne = newBounds.getNorthEast()
    this.props.stores.map.mapMoved(newCenter, newZoom, [
      [sw.lat, sw.lng],
      [ne.lat, ne.lng]
    ])
  }

  points(features) {
    console.log('drawing points')
    return features.map((feature, ri) => {
      return (
        <Marker
          fillColor={timeColor(feature.selection.temporal)}
          fillOpacity="1"
          weight="0"
          key={ri}
          radius={10}
          position={feature.geo}
          data={feature}
        />
      )
    })
  }

  render() {
    console.log('--map container')
    const mapStore = this.props.stores.map
    const features = this.props.stores.app.features

    return (
      <div className="container map-container">
        <MapComponent
          handleViewportChange={this.handleViewportChange.bind(this)}
          extent={mapStore.extent}
          zoom={mapStore.zoom}
          center={mapStore.center}
          points={this.points(features)}
        />
      </div>
    )
  }
}
