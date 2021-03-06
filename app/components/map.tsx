import React from 'react';
import { observer } from 'mobx-react';
import Base from './../helpers/base';
import Config from './../helpers/config';
import Colors from './../helpers/colors';
import { timeColor, markerBorderColor } from './../helpers/feature';
import L from 'leaflet';
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
  Tooltip,
} from 'react-leaflet';
import 'leaflet.markercluster';

import 'leaflet.markercluster.placementstrategies';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { SizeModel } from './../helpers/models';

type Props = {
  center: Array<Number>;
  zoom: Number;
  features: Array<Object>;
  handleViewportChange: Function;
};

@observer
export default class MapComponent extends React.Component<Props> {
  props;
  mapEl;
  markerClusterGroup;
  refs;
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    this.mapEl = this.refs['map'].leafletElement;
    this.props.handleViewportChange(
      this.props.center,
      this.props.zoom,
      this.mapEl.getBounds()
    );
  }

  handleMapMoved(e) {
    if (this.mapEl) {
      this.props.handleViewportChange(e.center, e.zoom, this.mapEl.getBounds());
    }
  }

  clusterMarkerIcon(cluster) {
    const markers = cluster.getAllChildMarkers();
    const single = markers.length === 1;

    const timeSelections = markers.map(
      marker => marker.options.data.selection.time
    );

    const attSelections = markers.map(
      marker => marker.options.data.selection.attributes
    );

    const spatialCertainties = markers.map(
      marker => marker.options.data.props.certainty_location
    );
    const existenceCertainties = markers.map(
      marker => marker.options.data.props.certainty_existence
    );

    const timeSelectionAvg = Base.average(timeSelections);
    const spatialCertaintiesAvg = Base.average(spatialCertainties);
    const existenceCertaintiesAvg = Base.average(existenceCertainties);
    const attSelectionHl = attSelections.some(a => a === 'highlighted');

    const color = markerBorderColor(Base.average(timeSelections));

    const existenceCertaintyRatio =
      0.3 + (1 - (existenceCertaintiesAvg - 1) / 2) * 0.7;

    const stripes =
      existenceCertaintyRatio === 1
        ? 'background-color: ' + color
        : Base.cssStripes(
            timeColor(timeSelectionAvg),
            5,
            existenceCertaintyRatio
          );

    const ids = markers.map(m => m.options.data.props.id);

    const markerOuterSize = single ? 40 : 70;
    const markerInnerSize = single ? 20 : 30;
    const markerMargin = (markerOuterSize - markerInnerSize) / 2;

    const innerStyle =
      ';width:' +
      markerInnerSize +
      ';height:' +
      markerInnerSize +
      ';margin-top:' +
      markerMargin +
      ';margin-left:' +
      markerMargin;

    const attBorderW = 4;
    const attStyle =
      ';width:' +
      (markerInnerSize + attBorderW) +
      ';height:' +
      (markerInnerSize + attBorderW) +
      ';margin-top:' +
      (markerMargin - attBorderW / 2) +
      ';margin-left:' +
      (markerMargin - attBorderW / 2);

    const fillMarker =
      '<div key="fill_' +
      ids +
      '" class="marker-icon marker-icon-fill" style="' +
      stripes +
      ';color: ' +
      Colors.temporal +
      innerStyle +
      '" >' +
      (single ? '' : markers.length) +
      '</div>';

    const strokeMarker =
      '<div key="stroke_' +
      ids +
      '" class="marker-icon marker-icon-stroke" style="border: 2px solid ' +
      color +
      innerStyle +
      '" >' +
      '</div>';

    const attStrokeMarker =
      '<div key="attribute_' +
      ids +
      '" class="marker-icon marker-icon-stroke marker-icon-attribute" style="border: ' +
      attBorderW +
      'px solid ' +
      Colors.attribute +
      attStyle +
      '" >' +
      '</div>';

    const spaceRadiusDelta = markerOuterSize - markerInnerSize;
    const spaceUncertaintyRadius =
      markerInnerSize +
      attBorderW +
      spaceRadiusDelta * ((spatialCertaintiesAvg - 1) / 2);

    const spaceUncertaintyMargin =
      (spaceRadiusDelta - (spaceUncertaintyRadius - markerInnerSize)) / 2;

    const spaceUncertaintyCircle =
      '<div key="space_uncertainty_' +
      ids +
      '" class="marker-icon marker-icon-certainty-circle" style="background-color: ' +
      color +
      '; width: ' +
      spaceUncertaintyRadius +
      'px; height: ' +
      spaceUncertaintyRadius +
      'px; margin: ' +
      spaceUncertaintyMargin +
      'px 0px 0px ' +
      spaceUncertaintyMargin +
      'px" >' +
      '</div>';

    return L.divIcon({
      html:
        '<div class="marker-icon-wrapper" key="marker_wrapper_' +
        ids +
        '">' +
        spaceUncertaintyCircle +
        (attSelectionHl ? attStrokeMarker : '') +
        fillMarker +
        strokeMarker +
        '</div>',
      className:
        'map-marker ' + (single ? 'map-marker-single' : 'map-marker-cluster'),
      iconSize: L.point(markerOuterSize, markerOuterSize),
      ids: ids,
    });
  }

  componentDidUpdate() {
    if (this.markerClusterGroup && this.markerClusterGroup.refreshClusters) {
      this.markerClusterGroup.refreshClusters();
    }
    this.mapEl.invalidateSize();
  }

  render() {
    return (
      <Map
        onViewportChanged={this.handleMapMoved.bind(this)}
        ref="map"
        className="component-map"
        attributionControl={false}
        zoom={this.props.zoom}
        center={this.props.center}
        maxZoom={20}
      >
        <ScaleControl position="topleft" imperial={false} />
        <AttributionControl position="bottomleft" />
        <TileLayer
          url="http://a.tiles.mapbox.com/v3/isawnyu.map-knmctlkh/{z}/{x}/{y}.png"
          attribution="<a href='http://awmc.unc.edu/wordpress/'>awmc</a>"
          className="map-base-layer-awmc"
        />
        <Pane>
          <MarkerClusterGroup
            onMouseOver={this.props.handleInspectMarkers}
            onMouseOut={this.props.handleCancelInspect}
            showCoverageOnHover={false}
            firstCircleElements={6}
            clockHelpingCircleOptions={{
              weight: 0.7,
              opacity: 1,
              color: 'black',
              fillOpacity: 0,
              dashArray: '10 5',
              transform: 'translateY(-10px)',
            }}
            spiderfyDistanceSurplus={35}
            zoomToBoundsOnClick={true}
            maxClusterRadius={Config.map.clusterRadius}
            removeOutsideVisibleBounds={true}
            elementsPlacementStrategy="clock-concentric"
            iconCreateFunction={this.clusterMarkerIcon}
            animate={false}
            singleMarkerMode={true}
            spiderLegPolylineOptions={{ weight: 0 }}
            ref={markerClusterGroup => {
              if (markerClusterGroup) {
                this.markerClusterGroup = markerClusterGroup.leafletElement;
              }
            }}
          >
            {this.props.points}
          </MarkerClusterGroup>
        </Pane>
      </Map>
    );
  }
}
