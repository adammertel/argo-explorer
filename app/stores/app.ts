import {
  keys,
  observable,
  action,
  computed,
  extendObservable,
  toJS,
} from 'mobx';

import Base from './../helpers/base';
import { featureProp, featureSelection } from './../helpers/feature';
import Config from './../helpers/config';

export default class AppStore {
  _sortProp;
  _dateSelection;
  _dataStore;
  _inspectedIds;
  timeBarOrdering;

  constructor(dataStore) {
    this._dataStore = dataStore;

    this._dateSelection = observable.box([
      550, //Config.dates.min,
      Config.dates.max,
    ]);
    this._inspectedIds = observable.box([]);

    this.timeBarOrdering = [
      {
        id: 'time_certainty',
        label: 'time certainty',
        fn: (f1, f2) => {
          return f1.selection['temporal'] > f2.selection['temporal'] ? 1 : -1;
        },
      },
      {
        id: 'after',
        label: 'ante quem',
        fn: (f1, f2) => {
          return f1.props['date_after'] > f2.props['date_after'] ? 1 : -1;
        },
      },
      {
        id: 'before',
        label: 'post quem',
        fn: (f1, f2) => {
          return f1.props['date_before'] > f2.props['date_before'];
        },
      },
    ];
    this._sortProp = observable.box(this.timeBarOrdering[0]);
  }

  @computed
  get inspectedIds(): Array<number> {
    return toJS(this._inspectedIds) ? toJS(this._inspectedIds).slice() : [];
  }

  @computed
  get inspectedFeatures(): Array<Object> {
    const ids = this.inspectedIds;
    const features = this._dataStore.features.filter(f =>
      ids.includes(f.props.id),
    );
    return features;
  }

  @computed
  get dateSelection(): Array<number> {
    return toJS(this._dateSelection).slice();
  }

  @computed
  get sortProp() {
    return this._sortProp.get();
  }

  @action
  changeSortProp(id: string): void {
    const sortAtt = this.timeBarOrdering.find(att => att.id === id);
    sortAtt && this._sortProp.set(sortAtt);
  }

  @computed
  get activeFeatures(): Array<Object> {
    const selection = window['stores'].selection.active;
    return window['stores'].data.features.map(feature => {
      feature.selection = featureSelection(feature, selection);
      return feature;
    });
  }

  @computed
  get sortMethod(): Function {
    return (a, b) => {
      let aRank = a.selection.spatial ? 100 : -100;
      let bRank = b.selection.spatial ? 100 : -100;

      aRank += this.sortProp.fn(a, b);
      return aRank > bRank ? -1 : 1;
    };
  }

  @action
  changeInspectedIds(newIds): void {
    this._inspectedIds.set(newIds);
  }

  @action
  changeMinDateSelection(newMinDate: number): void {
    const newDateSelection = this.dateSelection;
    newDateSelection[0] = newMinDate;
    this._dateSelection.set(this.validateTimeSelection(newDateSelection));
  }
  @action
  changeMaxDateSelection(newMaxDate: number): void {
    const newDateSelection = this.dateSelection;
    newDateSelection[1] = newMaxDate;
    this._dateSelection.set(this.validateTimeSelection(newDateSelection));
  }

  @action
  changeDateByClick(newDate: number): void {
    const newDateSelection = this.dateSelection;
    const minDiff = Math.abs(newDateSelection[0] - newDate);
    const maxDiff = Math.abs(newDateSelection[1] - newDate);

    if (minDiff < maxDiff) {
      newDateSelection[0] = newDate;
    } else {
      newDateSelection[1] = newDate;
    }
    this._dateSelection.set(newDateSelection);
  }

  validateTimeSelection(timeSelection): Array<number> {
    const validatedTimeSelection = timeSelection.slice();
    validatedTimeSelection[0] = Base.clamp(
      validatedTimeSelection[0],
      Config.dates.min,
      validatedTimeSelection[1] - 1,
    );
    validatedTimeSelection[1] = Base.clamp(
      validatedTimeSelection[1],
      validatedTimeSelection[0] + 1,
      Config.dates.max,
    );
    return validatedTimeSelection;
  }
}
