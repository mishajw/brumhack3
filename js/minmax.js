function MinMax(dataset, getter) {
    this.max = Number.MIN_VALUE;
    this.min = Number.MAX_VALUE;
    
	
    // Set the min and max values.
    for (var i=0; i<dataset.length; i++) {
        curVal = getter(dataset[i]);
        if (curVal > this.max) this.max = curVal;
        if (curVal < this.min) this.min = curVal;
    }
    
    // Should always return a value between 0 and 1.
    this.getScaledValue = function(val) {
        return (val - this.min) / (this.max - this.min);
    }
}
