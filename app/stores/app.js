import {
  keys,
  observable,
  action,
  computed,
  extendObservable
} from 'mobx'

import Base from './../helpers/base'

export default class AppStore {
  constructor () {
    this._loaded = observable.box(false)
  }

  @action load () {
    this._loaded.set(true)
  }
}
