
var LAST_DAY = 10;
var INIT_CASH = 100;

var QUESTION_DISMISSED = 0;
var QUESTION_NEW_DAY = 1; // params: day
var QUESTION_ITEM_TRANSACTION = 2; // params: item
var QUESTION_MARKET_EVENT = 3; // params: item, event

var Transition = React.addons.CSSTransitionGroup;

var DaContainer = React.createClass({
	getInitialState: function() {
		var items = [
				new Something('圆珠笔', 1),
				new Something('路边摊肉串', 10),
				new Something('二手自行车', 100),
				new Something('勾兑劣酒', 1000)
			].map(function(row){
				row.updatePrice();
				return row;
			});

		return {
			day: 1,
			money: INIT_CASH,
			totalAsset: INIT_CASH,
			items: items,
			questionContext: {
				type: QUESTION_DISMISSED,
				params: {}
			}
		};
	},

	handleBuySellAction: function(itemId, quantityInput, isBuy) {
		this.setState(function(previousState, currentProps) {
			var quantity = parseInt(quantityInput);
			var items = previousState.items.slice();
			var money = previousState.money;
		
			if(quantity > 0 && itemId >= 0 && itemId < items.length){
				var item = items[itemId];
				var sumPrice = item.currentPrice * quantity;

				if(isBuy){
					if(money < sumPrice) {
						this.handleNotification("Money inhand not enough! Buying " + quantity + " " + item.itemName + " @" + item.currentPrice + " has: " + money);
						return ;
					} else {
						money -= sumPrice;
						item.inhandQuantity += quantity;
						item.inhandCost += sumPrice;
					}					
				} else {
					if(item.inhandQuantity < quantity) {
						this.handleNotification("Quantity inhand not enough! Selling " + quantity + " " + item.itemName + " @" + item.currentPrice + " has: " + item.inhandQuantity );
						return ;
					} else {
						money += sumPrice;
						item.inhandCost *= (1 - quantity/item.inhandQuantity);
						item.inhandQuantity -= quantity;
					}					
				}
				return { money: money, items: items};
			}
		});
	},

	handleNextDayAction: function(key, event) {
		if(this.state.day + 1 > LAST_DAY){
			this.handleNotification("Last day! Total asset: " + this.state.totalAsset + ". Game reset...");
			this.replaceState(this.getInitialState());
		} else {
			var items = this.state.items.slice();
			var sumValue = 0;
			for (var i in items) {
				items[i].updatePrice();
				sumValue += items[i].inhandQuantity * items[i].currentPrice;
			}	
			this.setState(function(previousState, currentProps) {
				var totalAsset = previousState.money + sumValue;
				return {
					day: previousState.day + 1,
					totalAsset: totalAsset,
					items: items
				};
			});

			this.handleNotification("It is day " + (this.state.day+1));		
		}	
	},

	handleNotification: function(message) {
		this.setState(function() {
			return { 
				questionContext: {
					type: QUESTION_NEW_DAY,
					params: { 
						day: -1
					} 
				}
		}});
	},

	handleQuestionResponse: function(){
		this.setState(function() {
			return { 
				questionContext: {
					type: QUESTION_DISMISSED,
					params: { } 
				}
		}});		
	},

	render: function(){
		return (
			<div>
				<HeadingContainer day={this.state.day} 
								  totalAsset={this.state.totalAsset}
								  cash={this.state.money} />
				<MarketContainer items={this.state.items}/>
				<ControlContainer items={this.state.items}
								  onBuySellClick={this.handleBuySellAction} 
								  onNextDayClick={this.handleNextDayAction} />
				<Transition transitionName="question-container">
					{this.state.questionContext.type == QUESTION_DISMISSED ? null :
						<QuestionContainer questionContext={this.state.questionContext} 
										   onQuestionResponse={this.handleQuestionResponse}/>
					}
				</Transition>
			</div>
			);
	}
});

var HeadingContainer = React.createClass({
	render: function(){
		return (
			<div className="heading-container">
				<div className="timer-container">
					Day: <span >{this.props.day}</span>
				</div>
				<div className="scores-container">
					Net Asset: <span >{this.props.totalAsset}</span><br/>
					Cash: <span >{this.props.cash}</span>
				</div>
			</div>
		);
	}
});

var MarketContainer = React.createClass({
	render: function(){
		var items = this.props.items;
		return (
			<div className="market-container">
				<div className="market-container-title">Market</div>
					{items.map(function(item) {
						return (<div className="item-container-outer item-mask">
							<button className="item-container">
							<img src="images/box.png" alt={item.itemName} />
							<p>{item.itemName}</p>
							<p className="item-price">$ {item.currentPrice}</p>
							<p className="item-quantity">Qty: {item.inhandQuantity}</p>
							</button></div>
							);
					})}
			</div>
		);
	}
});

var ControlContainer = React.createClass({
	handleBuyAction: function () {
		this.props.onBuySellClick(
            this.refs.buyItemIdInput.getDOMNode().value,
            this.refs.buyQuantityInput.getDOMNode().value,
            true
        );
	},

	handleSellAction: function () {
		this.props.onBuySellClick(
            this.refs.sellItemIdInput.getDOMNode().value,
            this.refs.sellQuantityInput.getDOMNode().value,
            false
        );
	},

	render: function(){
		var items = this.props.items;
		return (
			<div className="control-container">
				<div className="buy-container">
					<select ref="buyItemIdInput">
						{items.map(function(item, index) {
							return (
								<option value={index}>{item.itemName}</option>
								);
						})}
					</select>
					<input type="number" ref="buyQuantityInput" />
					<button onClick={this.handleBuyAction} >Buy</button>
				</div>
				<div className="sell-container">
					<select ref="sellItemIdInput" >
						{items.map(function(item, index) {
							return (
								<option value={index}>{item.itemName}</option>
								);
						})}					
					</select>
					<input type="number" ref="sellQuantityInput" />
					<button onClick={this.handleSellAction}>Sell</button>
				</div>
				<div className="offwork-container">
					<br />
					<button onClick={this.props.onNextDayClick}>New Day</button>
				</div>
			</div>
		);
	}
});

var QuestionContainer =  React.createClass({
	handleClose: function(){
		this.props.onQuestionResponse();
	},

	render: function(){
		var message = this.props.questionContext.type != QUESTION_DISMISSED ? this.props.questionContext.message : "";
		return (
			<div key={this.props.questionContext.type} className="question-container">
				<div className="question-modal">
					<p>{message}</p>
					<p>
						<button onClick={this.handleClose}>Dalah!</button>
					</p>
				</div>
				<div className="question-background" onClick={this.handleClose}></div>
			</div>
		);
	}
});

React.render(<DaContainer />, document.getElementById('container'));