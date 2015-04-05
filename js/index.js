/** @jsx React.DOM */
var BoardView = React.createClass({
  getInitialState: function () {
    return {
      board: new Board(3, 1000, 2000),
      showOverlay: true,
      endGame: false
    };
  },

  startGame: function (overlay) {
    this.setState({
      board: new Board(3, 1000, 2000),
      totalClick: 0,
      effectiveClick: 0,
      showOverlay: false,
      startGame: true
    });
  },

  handleGameOver: function () {
    this.state.endGame = true;
    this.setState(this.getInitialState());
  },

  handleCellClickClick: function (cell, isEffective) {
    // TODO: statistics
    this.setState({
      totalClick: this.state.totalClick + 1,
      effectiveClick: this.state.effectiveClick + (isEffective ? 1 : 0)
    });
  },

  handleCellGenerate: function (cell) {
    // TODO: check if board's cells have all tiles
    if (this.state.board.checkCells()) {
      this.handleGameOver();

      // Stop cell interval
      return true;
    }
  },

  render: function () {
    var self = this;
    var cells = self.state.board.cells.map(function (row) {
      return (<div className='row'>
        {
          row.map(function (col) {
            return <CellView
              tile={col}
              onCellClick={self.handleCellClickClick}
              onCellGenerate={self.handleCellGenerate}
              startGame={self.state.startGame}
              endGame={self.state.endGame} />;
          })
        }
      </div>);
    });

    return (
      <div className='board'>
        <ScoreBox totalClick={this.state.totalClick} effectiveClick={this.state.effectiveClick} />
        {cells}
        <Overlay board={this.state.board} show={this.state.showOverlay} onStart={this.startGame} />
      </div>
    );
  }
});


var CellView = React.createClass({
  getInitialState: function () {
    return { tile: this.props.tile };
  },
  handleClick: function () {
      // Board callback function for global event handle
      var isEffective = false;
      if (this.state.tile.hasShown()) {
        // Rendering renew cell class on updating the state
        this.state.tile.setHide();
        this.setState({ tile: this.state.tile });

        isEffective = true;
      }
      this.props.onCellClick(this, isEffective);
  },

  // Core function for tiles generation and callbacks to board
  handleLifeCycle: function () {
    var self = this;
    // Generate tiles by input interval of board
    self.state.intervalVariable = setInterval(function () {

      // Callback function in board, check if the game is over
      if (self.props.onCellGenerate(self.props.tile)) {
        // Shitty loop to clear all interval...sorry about that
        for (var i = 1; i < 99999; i++) {
          window.clearInterval(i);
        }
        return;
      }

      // Random generation in certain interval
      if (self.props.tile.getRandomBoolean()) {
        // show tile and update the rendering
        self.props.tile.setShow();
        self.setState({ tile: self.props.tile });
      }
    }, self.props.tile.interval);

  },

  render: function () {
    if (this.props.startGame) {
      this.handleLifeCycle();
    } else {
      // initial empty cell from board
      this.state.tile = this.props.tile;
    }

    var cs = React.addons.classSet;
    console.log('rendering');
    var classes = cs({
      'cell': true,
      'tile b-red': this.state.tile.hasShown() ? true : false
    });
    return (
      <span className={classes} onClick={this.handleClick}>{''}</span>
    );
  }
});


var Overlay = React.createClass({
  handleClick: function() {
    this.setState({ show: false });
    this.props.onStart(this);
  },
  render: function () {
    var cs = React.addons.classSet;
    var board = this.props.board;
    // TODO: is first start of already end
    this.props.buttonWording = 'Start';
    this.props.wording = 'GO GO GO';

    var classes = cs({
      'overlay': true,
      'visible': this.props.show,
      'hidden': !this.props.show
    });
    return (
      <div className={classes}>
        <p className='message'>{this.props.wording}</p>
        <button className="startButton b-lblue" onClick={this.handleClick}>{this.props.buttonWording}</button>
      </div>
    );
  }
});

var ScoreBox = React.createClass({
  render: function () {
    var percentage = this.props.effectiveClick / this.props.totalClick * 100;
    percentage = percentage ? percentage.toFixed(2) : 0;
    return <div>
      <h1>APM: {this.props.totalClick}</h1>
      <h1>EPM: {this.props.effectiveClick}</h1>
      <h1>Percentage: {percentage} %</h1>
    </div>
  }
});

React.render(<BoardView />, document.getElementById('board'));