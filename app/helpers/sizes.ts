var sizeValues = {
  panel: {},
  time: {
    bars: {
      width: 6,
      stroke: 8,
      margin: 2,
    },
    lines: {
      topHeight: 40,
      middleHeight: false,
      bottomHeight: 100,
    },
    components: {
      histogramWidth: 0,
      selectorWidth: 100,
      legendWidth: 30,
      barchartWidth: 'derived',
    },
    margins: 10,
  },
};

class Sizes {
  values;

  constructor(sizeValues) {
    this.values = sizeValues;

    this.values.time.bars.space =
      this.values.time.bars.stroke + this.values.time.bars.margin;
  }
}

var sizes = new Sizes(sizeValues);
export default sizes;
