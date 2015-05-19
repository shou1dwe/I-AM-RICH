
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

	handleBuySellAction: function(itemId, quantity, isBuy) {
		this.setState(function(previousState, currentProps) {
			var items = previousState.items.slice();
			var money = previousState.money;
			if(quantity > 0 && itemId >= 0 && itemId < items.length){
				var item = items[itemId];
				var sumPrice = item.currentPrice * quantity;
				if(isBuy){
					money -= sumPrice;
					item.inhandQuantity += quantity;
					item.inhandCost += sumPrice;
				} else {
					money += sumPrice;
					item.inhandCost *= (1 - quantity/item.inhandQuantity);
					item.inhandQuantity -= quantity;
				}
				var questionContext = previousState.questionContext;
				questionContext.params.item = item;
				questionContext.params.money = money;
				return { money: money, items: items, questionContext: questionContext};
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

	handleItemClick: function(itemId){
		this.handleNotification(QUESTION_ITEM_TRANSACTION, {
			item: this.state.items[itemId],
			money: this.state.money,
			onItemBuySell: this.handleBuySellAction
		});
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
				<MarketContainer items={this.state.items} onItemClick={this.handleItemClick}/>
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
		var self = this, items = this.props.items;
		return (
			<div className="market-container">
				<div className="market-container-title">Market</div>
					{items.map(function(item) {
						return (<div className="item-container-outer item-mask">
							<button className="item-container" onClick={self.props.onItemClick.bind(this, item.itemId)}>
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
		var context = this.props.questionContext;
		var switchablePart;
		switch(context.type) {
			case QUESTION_NEW_DAY:
				switchablePart = <QuestionInfoComponent 
					message={"It is day " + context.params.day}
	 				handleClose={this.handleClose} />
			break;
			case QUESTION_LAST_DAY:
				switchablePart = <QuestionInfoComponent 
					message={"Last day! Total asset: " + context.params.totalAsset + ". Game reset..."}
	 				handleClose={this.handleClose} />
			break;
			case QUESTION_ITEM_TRANSACTION:
				switchablePart = <QuestionItemTransacComponent item={context.params.item}
					money={context.params.money}
					handleBuySell={context.params.onItemBuySell}
					handleClose={this.handleClose} />
			break;
		}
		return (
			<div key={context.type} className="question-container">
				{switchablePart}
				<div className="question-background" onClick={this.handleClose}></div>
			</div>
		);
	}
});

var QuestionInfoComponent = React.createClass({
	render: function(){
		return (
			<div className="question-modal">
				<p>{this.props.message}</p>
				<p>
					<button onClick={this.props.handleClose}>Dalah!</button>
				</p>
			</div>
		);
	}
});

var QuestionItemTransacComponent = React.createClass({
	getInitialState: function() {
		return {
			quantity: 0,
			warning: ""
		};
	},

	warn: function(content) {
		this.setState(function(previousState, currentProps) {
				return {
					warning: content
				};
			});
	},

	onBuySell: function (isBuy) {
		var item = this.props.item, money = this.props.money;
		var quantity = this.state.quantity;
		if(isBuy && money < quantity * item.currentPrice){
			this.warn("Insufficient Fund");
		} else if (!isBuy && item.inhandQuantity < quantity){
			this.warn("Insufficient Stock");
		} else {
			this.replaceState(this.getInitialState());
			this.props.handleBuySell(item.itemId, quantity, isBuy);
		}
	},

	onButtonClick: function (value) {
		this.setState(function(previousState, currentProps) {
			var quantity = 0;
			switch(value) {
				case 'A':
					quantity = 0;
				break;
				case 'B':
					quantity = previousState.quantity > 0 ? Math.floor(previousState.quantity/10) : previousState.quantity;
				break;
				default:
					quantity = previousState.quantity < 100000000000 ? previousState.quantity * 10 + parseInt(value) : previousState.quantity;
				break;
			}
			return {
				warning: "",
				quantity: quantity
			}
		});
	},

	render: function(){
		var item = this.props.item;
		return (
			<div className="question-modal">
				<p>{item.itemName} ${item.currentPrice}<br />
				Inhand Qty: {item.inhandQuantity}<br />
				Cash: {this.props.money}</p>
				<p>{this.state.warning}</p>
				<p>{this.state.quantity}</p>
				<p>
					<CalculatorButton displayText="1" value="1" onButtonClick={this.onButtonClick} />
					<CalculatorButton displayText="2" value="2" onButtonClick={this.onButtonClick} />
					<CalculatorButton displayText="3" value="3" onButtonClick={this.onButtonClick} />
					<CalculatorButton displayText="4" value="4" onButtonClick={this.onButtonClick} />
					<CalculatorButton displayText="5" value="5" onButtonClick={this.onButtonClick} />
					<CalculatorButton displayText="6" value="6" onButtonClick={this.onButtonClick} />
					<CalculatorButton displayText="7" value="7" onButtonClick={this.onButtonClick} />
					<CalculatorButton displayText="8" value="8" onButtonClick={this.onButtonClick} />
					<CalculatorButton displayText="9" value="9" onButtonClick={this.onButtonClick} />
					<CalculatorButton displayText="CLEAR" value="A" onButtonClick={this.onButtonClick} />
					<CalculatorButton displayText="0" value="0" onButtonClick={this.onButtonClick} />
					<CalculatorButton displayText="<" value="B" onButtonClick={this.onButtonClick} />
				</p>
				<p>
					<button onClick={this.onBuySell.bind(this, true)}>BUY</button>
					<button onClick={this.onBuySell.bind(this, false)}>SELL</button>
				</p>
			</div>
		);
	}
});

var CalculatorButton = React.createClass({
	render: function() {
		var self = this;
		return (
			<div className="cal-button-mask">
				<button className="cal-button" onClick={self.props.onButtonClick.bind(this, self.props.value)}>{this.props.displayText}</button>
			</div>
		);
	}
});

React.render(<DaContainer />, document.getElementById('container'));