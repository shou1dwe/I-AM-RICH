var Something = function(itemName, seedPrice){
	this.itemName = itemName;
	this.seedPrice = seedPrice;
	this.currentPrice = 999999999;
	this.inhandQuantity = 0;
	this.inhandCost = 0.0;
};

Something.prototype.setItemId = function(itemId) {
	this.itemId = itemId;
};

Something.prototype.updatePrice = function() {
	this.currentPrice = Math.round(this.seedPrice * (Math.random() * 2 + 0.5));
	return this.currentPrice;
};

Something.prototype.getInhandAveragePrice = function() {
	return this.inhandQuantity > 0 ? this.inhandCost / this.inhandQuantity : 0;
};

Something.prototype.resetInhand = function() {
	this.currentPrice = 999999999;
	this.inhandQuantity = 0;
	this.inhandCost = 0.0;
};