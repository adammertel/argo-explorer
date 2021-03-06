import { observable, action, computed, toJS } from 'mobx'
import Base from './../helpers/base'
import { SizeModel } from './../helpers/models'
import sizes from './../helpers/sizes'

export default class ScreenStore {
  _width
  _height
  _resizing

  constructor() {
    this._width = observable.box(0)
    this._height = observable.box(0)
    this._resizing = false

    window.addEventListener(
      'resize',
      Base.debounce(() => {
        this.getScreenSizes()
      })
    )
  }

  @computed
  get width(): number {
    return toJS(this._width)
  }

  @computed
  get height(): number {
    return toJS(this._height)
  }

  @action
  setScreenSizes(): void {
    this._height.set(Base.screenHeight())
    this._width.set(Base.screenWidth())
  }

  @computed
  get _timePanelSizes(): SizeModel {
    return {
      width: this._mapTimeWidth + 'px',
      height: sizes.values.panel.timeHeight + 'px',
      left: '0px',
      top: this._mapHeight + 'px'
    }
  }

  @computed
  get _attributePanelSizes(): SizeModel {
    return {
      width: sizes.values.panel.attributeWidth + 'px',
      height: '100%',
      left: this._mapTimeWidth + 'px',
      top: '0px'
    }
  }

  @computed
  get _mapPanelSizes(): SizeModel {
    return {
      width: this._mapTimeWidth + 'px',
      height: this._mapHeight + 'px',
      left: '0px',
      top: '0px'
    }
  }

  @computed
  get _mapHeight(): Number {
    return this.height - sizes.values.panel.timeHeight
  }

  @computed
  get _mapTimeWidth(): Number {
    return this.width - sizes.values.panel.attributeWidth
  }

  getScreenSizes(): void {
    console.log('****getting screen size')
    this.setScreenSizes()
  }
}
