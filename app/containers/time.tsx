import React from 'react';
import { observer } from 'mobx-react';

import TimeBarchartComponent from './../components/time/barchart';
import TimeLegendComponent from './../components/time/legend';
import TimeProfileComponent from './../components/time/profile';
import TimeSelectorComponent from './../components/time/selector';
import TimeSettingsComponent from './../components/time/settings';

import Config from './../helpers/config';
import { featureProp, timeColor } from './../helpers/feature';
import Base from './../helpers/base';
import { SizeModel } from './../helpers/models';
import sizes from './../helpers/sizes';

type Props = {
  stores: Array<Object>;
  sizes: SizeModel;
};

@observer
export default class TimeContainer extends React.Component<Props> {
  props;
  width;
  height;
  positions;
  features;
  noFeatures;
  selectors;
  inMapArea;
  timeBars;
  _middleTM; // margin of y for the middle components
  state;
  setState;
  wrapperEl;

  constructor(props: any) {
    super(props);
    this._middleTM = 20;
    this.state = {
      selectionX: 0,
      width: 0,
      height: 0,
    };
    this.wrapperEl = React.createRef();
  }

  componentDidMount() {
    this._updateSizes();
  }

  componentDidUpdat() {
    this._updateSizes();
  }

  _updateSizes() {
    const divEl = this.wrapperEl.current;
    const newHeight = divEl.clientHeight;
    const newWidth = divEl.clientWidth;

    if (newHeight !== this.state.height || newWidth !== this.state.width) {
      this.setState({
        height: newHeight,
        width: newWidth,
      });
    }
  }

  handleCancelInspect() {
    this.props.stores.app.changeInspectedIds([]);
  }

  handleInspectMarkers(id) {
    this.props.stores.app.changeInspectedIds([id]);
  }

  handleTimeSelectDragMin(e) {
    const newY = e.target.attrs.y;
    const newDate = this.yToDate(this.positions.selector.h, newY);
    this.props.stores.app.changeMinDateSelection(newDate);
  }

  handleTimeSelectDragMax(e) {
    const newY = e.target.attrs.y;
    const newDate = this.yToDate(this.positions.selector.h, newY);
    this.props.stores.app.changeMaxDateSelection(newDate);
  }

  _handleTimelineDrag(e) {
    const newX = e.target.attrs.x;
    this.setState({ selectionX: newX / this.positions.profile.w });
    //console.log('timeline dragged', newX);
  }

  handleRangeClick(e) {
    const y = e.evt.layerY;
    const clickedDate = this.yToDate(this.positions.selector.h, y);
    this.props.stores.app.changeDateByClick(clickedDate);
  }

  handleIncrementMin(by: number) {
    const appStore = this.props.stores.app;
    const minDate = appStore.dateSelection[0];
    this.props.stores.app.changeMinDateSelection(minDate + by);
  }

  handleIncrementMax(by: number) {
    const appStore = this.props.stores.app;
    const maxDate = appStore.dateSelection[1];
    this.props.stores.app.changeMaxDateSelection(maxDate + by);
  }

  _calculatePositions() {
    const margins = sizes.values.time.margins;
    const h = this.height - margins * 2;
    const w = this.width - margins * 2;

    const lineHeightTop = sizes.values.time.lines.topHeight;
    const lineHeightBottom = sizes.values.time.lines.bottomHeight;
    const lineHeightMiddle = h - (lineHeightTop + lineHeightBottom);

    const componentWidths = sizes.values.time.components;
    const histogramWidth = componentWidths.histogramWidth;
    const selectorWidth = componentWidths.selectorWidth;
    const legendWidth = componentWidths.legendWidth;
    const barchartWidth = w - (histogramWidth + selectorWidth + legendWidth);

    return {
      settings: {
        h: lineHeightTop,
        w: w,
        x: margins,
        y: margins,
      },
      historgram: {
        h: lineHeightMiddle,
        w: histogramWidth,
        x: margins,
        y: lineHeightTop,
      },
      selector: {
        h: lineHeightMiddle,
        w: selectorWidth,
        x: histogramWidth,
        y: lineHeightTop,
      },
      legend: {
        h: lineHeightMiddle,
        w: legendWidth,
        x: histogramWidth + selectorWidth,
        y: lineHeightTop,
      },
      barchart: {
        h: lineHeightMiddle,
        w: barchartWidth,
        x: histogramWidth + selectorWidth + legendWidth,
        y: lineHeightTop,
      },
      profile: {
        h: lineHeightBottom,
        w: w,
        x: margins,
        y: lineHeightTop + lineHeightMiddle,
      },
    };
  }

  _calculateSelectors() {
    const barchartW = this.positions.barchart.w;
    const profileW = this.positions.profile.w;
    const barSpace = sizes.values.time.bars.space;

    const barsNo = barchartW / barSpace;
    const profileBarW = profileW / this.noFeatures;

    const wAllFeaturesBar = this.noFeatures * barSpace;

    return {
      profile: {
        w: profileBarW * barsNo,
        x: this.state.selectionX * profileW,
      },
      barchart: {
        x: this.state.selectionX * wAllFeaturesBar,
      },
    };
  }

  _calculateInMapArea() {
    const inMapFeatures = this.features.filter(f => f.selection.space).length;

    const profileW = this.positions.profile.w;

    const barChartBarW = sizes.values.time.bars.space;
    const profileBarW = profileW / this.noFeatures;

    return {
      profile: profileBarW * inMapFeatures,
      barchart: barChartBarW * inMapFeatures,
    };
  }

  timelineBars(h, w) {
    const store = this.props.stores.app;
    const barW = w / this.features.length;

    return this.features.map((feature, fi) => {
      const dateMin = featureProp(feature, 'dateMin');
      const dateMax = featureProp(feature, 'dateMax');
      const yMax = this.dateToY(h, dateMax);
      const yMin = this.dateToY(h, dateMin);
      const barH = yMin - yMax;

      return {
        circle: dateMax - dateMin < Config.dates.barCircleTreshold,
        y: yMax,
        x: fi * barW,
        h: barH,
        w: barW,
      };
    });
  }

  _calculateBars() {
    const h = this.positions.barchart.h;
    return this.features.map((feature, fi) => {
      const dateMin = featureProp(feature, 'dateMin');
      const dateMax = featureProp(feature, 'dateMax');
      const yMax = this.dateToY(h, dateMax);
      const yMin = this.dateToY(h, dateMin);
      const barH = yMin - yMax;

      return {
        circle: dateMax - dateMin < Config.dates.barCircleTreshold,
        id: feature.props.id,
        y: yMax,
        x: fi,
        h: barH,
        existence: feature.props.certainty_existence,
        fill: timeColor(feature.selection.time),
        spatial: feature.selection.spatial,
        attributional: feature.selection.attributes,
      };
    });
  }

  timeTicks(h: number) {
    const minDate = Config.dates.min;
    const maxDate = Config.dates.max;
    return Base.intRangeArray(minDate - 1, maxDate + 1)
      .filter(i => !(i % 100))
      .map(i => ({
        y: this.dateToY(h, i),
        date: i,
      }));
  }

  /* returns the y coordinate for the given date */
  dateToY(h: number, date: number) {
    const hm = h - 2 * this._middleTM;
    const minDate = Config.dates.min;
    const maxDate = Config.dates.max;
    const oneYearPxs = hm / (maxDate - minDate);
    return Math.round(oneYearPxs * (maxDate - date)) + this._middleTM;
  }

  /* returns the date for the given y */
  yToDate(h: number, y: number) {
    const hm = h - 2 * this._middleTM;
    const minDate = Config.dates.min;
    const maxDate = Config.dates.max;
    const onePxYears = (maxDate - minDate) / hm;
    return maxDate - Math.round(onePxYears * (y - this._middleTM));
  }

  filterableColumns(): Array<Object> {
    return this.props.stores.filter.columns();
  }

  render() {
    const appStore = this.props.stores.app;
    const screenStore = this.props.stores.screen;
    const filterStore = this.props.stores.filter;

    this.features = appStore.activeFeatures;
    //console.log(this.features);
    this.noFeatures = this.features.length;

    this.width = this.state.width; //parseInt(this.props.sizes.width(), 10);
    this.height = this.state.height; //parseInt(this.props.sizes.height(), 10);

    this.positions = this._calculatePositions();
    this.selectors = this._calculateSelectors();

    const timeTicks = this.timeTicks(this.positions.selector.h);
    this.timeBars = this._calculateBars();

    this.inMapArea = this._calculateInMapArea();

    const selectedMaxDateY = this.dateToY(
      this.positions.selector.h,
      appStore.dateSelection[1]
    );

    const selectedMinDateY = this.dateToY(
      this.positions.selector.h,
      appStore.dateSelection[0]
    );

    return (
      <div
        ref={this.wrapperEl}
        style={{ height: '100%' }}
        className="container container-time"
      >
        {this.width && this.height ? (
          <div className="container-time-content">
            <TimeSettingsComponent
              store={appStore}
              position={this.positions.settings}
            />
            <hr className="line" style={{ top: this.positions.settings.h }} />
            <TimeBarchartComponent
              position={this.positions.barchart}
              bars={this.timeBars}
              ticks={timeTicks}
              margin={this._middleTM}
              offset={this.selectors.barchart.x}
              selectedMinDateY={selectedMinDateY}
              selectedMaxDateY={selectedMaxDateY}
              inMapArea={this.inMapArea.barchart}
              handleCancelInspect={this.handleCancelInspect.bind(this)}
              handleInspectMarkers={this.handleInspectMarkers.bind(this)}
            />
            <TimeLegendComponent
              position={this.positions.legend}
              margin={this._middleTM}
              ticks={timeTicks}
            />
            <TimeSelectorComponent
              margin={this._middleTM}
              minDateY={this.dateToY(
                this.positions.selector.h,
                Config.dates.min
              )}
              maxDateY={this.dateToY(
                this.positions.selector.h,
                Config.dates.max
              )}
              selectedMinDateY={selectedMinDateY}
              selectedMaxDateY={selectedMaxDateY}
              minDate={appStore.dateSelection[0]}
              maxDate={appStore.dateSelection[1]}
              position={this.positions.selector}
              onDragMin={this.handleTimeSelectDragMin.bind(this)}
              onDragMax={this.handleTimeSelectDragMax.bind(this)}
              rangeClicked={this.handleRangeClick.bind(this)}
              incrementMin={this.handleIncrementMin.bind(this)}
              incrementMax={this.handleIncrementMax.bind(this)}
            />
            <TimeProfileComponent
              inMapArea={this.inMapArea.profile}
              bars={this.timelineBars(
                this.positions.profile.h,
                this.positions.profile.w
              )}
              onDrag={this._handleTimelineDrag.bind(this)}
              selection={this.selectors.profile}
              position={this.positions.profile}
            />
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  }
}
