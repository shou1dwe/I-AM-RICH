
var LAST_DAY = 10;
var INIT_CASH = 100;

var QUESTION_DISMISSED = 0;
var QUESTION_NEW_DAY = 1; // params: day
var QUESTION_LAST_DAY = 2; // params: totalAsset
var QUESTION_ITEM_TRANSACTION = 3; // params: item
var QUESTION_MARKET_EVENT = 4; // params: item, event

var Transition = React.addons.CSSTransitionGroup;

var DaContainer = React.createClass({
	getInitialState: function() {
		var items = [
				new Something('圆珠笔', 1),
				new Something('路边摊肉串', 10),
				new Something('二手自行车', 100),
				new Something('勾兑劣酒', 1000)
			].map(function(row, index){
				row.setItemId(index);
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
			this.handleLastDayQuestion(this.state.totalAsset);
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

			this.handleNextDayQuestion(this.state.day+1);		
		}	
	},

	handleLastDayQuestion: function(totalAsset) {
		this.handleNotification(QUESTION_LAST_DAY, {totalAsset: totalAsset});
	},

	handleNextDayQuestion: function(day) {
		this.handleNotification(QUESTION_NEW_DAY, {day: day});
	},

	handleNotification: function(type, params) {
		this.setState(function() {
			return {questionContext: {type: type, params: params}}
		});
	},

	handleQuestionResponse: function(){
		switch(this.state.questionContext.type){
			case QUESTION_LAST_DAY:
				this.replaceState(this.getInitialState());
			break;
			default:
				this.handleNotification(QUESTION_DISMISSED, {});
			break;
		}
	},

	render: function(){
		return (
			<div>
				<HeadingContainer day={this.state.day} 
								  totalAsset={this.state.totalAsset}
								  cash={this.state.money} />
				<MarketContainer items={this.state.items}/>
				<ControlContainer onNextDayClick={this.handleNextDayAction} />
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
	render: function(){
		var items = this.props.items;
		return (
			<div className="control-container">
				<div className="offwork-container">
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
		var message = "";
		switch(this.props.questionContext.type) {
			case QUESTION_NEW_DAY:
				message = "It is day " + this.props.questionContext.params.day
			break;
			case QUESTION_LAST_DAY:
				message = "Last day! Total asset: " + this.props.questionContext.params.totalAsset + ". Game reset...";
			break;
		}
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