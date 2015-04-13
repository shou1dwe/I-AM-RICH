
var LAST_DAY = 11;

var money = 0;
var totalAsset = 0;
var day = 0;

var items = [
new Something('圆珠笔', 1),
new Something('路边摊肉串', 10),
new Something('二手自行车', 100),
new Something('勾兑劣酒', 1000)
]

function onPurchase(id, quantity){
	if(quantity > 0 && id >= 0 && id < items.length){
		var item = items[id];
		var sumPrice = item.currentPrice * quantity;

		if(money < sumPrice) {
			alert("Money inhand not enough! Buying " + quantity + " " + item.itemName + " @" + item.currentPrice + " has: " + money);
		} else {
			money -= sumPrice;
			item.inhandQuantity += quantity;
			item.inhandCost += sumPrice;
		}
	}
}

function onSell(id, quantity){
	if(quantity > 0 && id >= 0 && id < items.length){
		var item = items[id];
		var sumPrice = item.currentPrice * quantity;

		if(item.inhandQuantity < quantity) {
			alert("Quantity inhand not enough! Selling " + quantity + " " + item.itemName + " @" + item.currentPrice + " has: " + item.inhandQuantity );
		} else {
			money += sumPrice;
			item.inhandCost *= (1 - quantity/item.inhandQuantity);
			item.inhandQuantity -= quantity;
		}
	}
}

function onItemsUpdatePrice(){
	for (var i in items) {
		items[i].updatePrice();
		// console.log(items[i]);
	}
}

function onDayEnd(){
	// getStatus();
	day++;
	if(day >= LAST_DAY){
		alert("Last day! Total asset: " + totalAsset + ". Game reset...");
		resetState();
	} else {
		onItemsUpdatePrice();
		recalculateTotalAsset();
		alert("It is day " + day);		
	}
}

function recalculateTotalAsset(){
	var sumValue = 0;
	for (var i in items) {
		sumValue += items[i].inhandQuantity * items[i].currentPrice;
	}	
	totalAsset = money + sumValue;
}

function getStatus(){
	console.log("Day " + day + " Summary: ");
	console.log("Money: " + money);
	var sumValue = 0;
	for (var i in items) {
		console.log(items[i]);
		sumValue += items[i].inhandQuantity * items[i].currentPrice;
	}	
	console.log("Total Asset: $" + (money + sumValue));
}

// button listeners
function onBuyClick(){
	var buyId = getInputValueById("buy-option-container");
	var buyQuantity = getInputValueById("buy-quantity");
	if(isNumber(buyQuantity)){
		onPurchase(buyId, parseInt(buyQuantity));
	}
	render();
}

function onSellClick(){
	var sellId = getInputValueById("sell-option-container");
	var sellQuantity = getInputValueById("sell-quantity");

	if(isNumber(sellQuantity)){
		onSell(sellId, parseInt(sellQuantity));
	}
	render();
}

function onOffworkClick(){
	onDayEnd();
	render();
}

// View Render Functions
function render(){
	setDisplayValueById("day-value", day);
	setDisplayValueById("total-value", totalAsset);
	setDisplayValueById("cash-value", money);


	for (var i in items) {
		// display in market container
		setDisplayValueById(i+"-name", items[i].itemName);
		setDisplayValueById(i+"-price", items[i].currentPrice);

		// check if inhand: display in stock container
		if(items[i].inhandQuantity > 0){
			setDisplayValueById(i+"-stock-name", items[i].itemName);
			setDisplayValueById(i+"-stock-quantity", items[i].inhandQuantity + " 个");
		} else {
			setDisplayValueById(i+"-stock-name", items[i].itemName);
			setDisplayValueById(i+"-stock-quantity", items[i].inhandQuantity + " 个");
		}

		// display in buy option
		setDisplayValueById("buy-option-"+i, items[i].itemName);
		setDisplayValueById("sell-option-"+i, items[i].itemName);
	}
}

function setDisplayValueById(id, value){
	var elem = document.getElementById(id);
	elem.innerHTML = value;
}

function getInputValueById(id){
	var elem = document.getElementById(id);
	return elem.value ;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function main(){
	totalAsset = money = 100;
	onDayEnd();
	render()
}

function resetState(){
	day = 0;
	for (var i in items) {
		items[i].resetInhand();
	}
	main();
}

main();
