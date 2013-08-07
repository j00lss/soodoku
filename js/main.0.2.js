/*jslint devel: true, browser: true, sloppy: true, eqeq: true, plusplus: true, maxerr: 100, indent: 4, nomen: true */

var JOB = JOB || {},
	$ = $ || {},
	_ = _ || {};

JOB.Sudoku = (function () {
	var _boardSelector = '#board',
		_boardMatrix = [
			[1, 2, 3, 4, 5, 6, 7, 8, 9],
			[1, 2, 3, 4, 5, 6, 7, 8, 9],
			[1, 2, 3, 4, 5, 6, 7, 8, 9],
			[1, 2, 3, 4, 5, 6, 7, 8, 9],
			[1, 2, 3, 4, 5, 6, 7, 8, 9],
			[1, 2, 3, 4, 5, 6, 7, 8, 9],
			[1, 2, 3, 4, 5, 6, 7, 8, 9],
			[1, 2, 3, 4, 5, 6, 7, 8, 9],
			[1, 2, 3, 4, 5, 6, 7, 8, 9]
		],
		_backtrackWarnings = [],
		_fuseLimit = 200,

		self = {
			fuse: function (msg) {
				_fuseLimit--;
				if (_fuseLimit < 0) {
					throw new Error('Iteration fuse blew: ' + (msg || ''));
				}
			},

			randomNumber: function (seed) {
				var returnValue = 0;
				if (seed) {
					returnValue = Math.random() * seed;
					//JOB.log('randomizing: ' + returnValue + ' = ' + Math.ceil(returnValue));
					return Math.ceil(returnValue);
				
				} else {
					return -1;
				}
			},

			getUniqueRandomNumber: function (availableNumbersX, availableNumbersY) {
				var spliceIndex = 0,
					intersection = [],
					newNumber = 0,
					getNewNumberOneDim = function () {
						spliceIndex = self.randomNumber(availableNumbersX.length) - 1;
						newNumber = availableNumbersX[spliceIndex];
					},
					getNewNumberTwoDim = function () {
						spliceIndex = self.randomNumber(intersection.length) - 1;
						newNumber = intersection[spliceIndex];
					};

				if (availableNumbersY === undefined) { // check only one dimension - first row
					getNewNumberOneDim();

					//JOB.log('newNumber: ' + newNumber);
					//JOB.log('== X == ' + availableNumbersX);

					availableNumbersX.splice(spliceIndex, 1);

				} else {
					intersection = _.intersection(availableNumbersX, availableNumbersY);
					JOB.log('+ + + + + +  intersection: ' + ((intersection.length > 0) ? intersection : 'NONE') + ' of ' + availableNumbersX + 'x' + availableNumbersY);	

					if (intersection.length < 1) {
						return { backtrack: true };
					}

					getNewNumberTwoDim();
					// if intersection length == 1, then check below will be caught in a neverending loop
					
					if (_backtrackWarnings.length > 0) {
						JOB.log('/ / / / bt warning in effect: ' + _backtrackWarnings);
						while (newNumber === _backtrackWarnings[0]) {
							JOB.log('| | | | getting new number: ' + newNumber);
							getNewNumberTwoDim();
							self.fuse('_backtrackWarnings check');
						}
						//_backtrackWarnings.pop();
					}

					//JOB.log('newNumber: ' + newNumber);
					//JOB.log('== X == ' + availableNumbersX);
					//JOB.log('== Y == ' + availableNumbersY || '(no Y)');

					availableNumbersX.splice(_.indexOf(availableNumbersX, newNumber), 1);	

				}

				//JOB.log('== intersection == ' + intersection);
				//JOB.log('avail after check: ' + availableNumbersX);

				return {
					randomNumber: newNumber,
					splicedNumbersX: availableNumbersX
				};
			},

			placeNumbers: function () {
				var rowIndex = 0,
					rowLength = 0,
					cellIndex = 0,
					cellLength = 0,
					visitedCellIndex = 0,

					randomNumbersOfRow = [],

					availableNumbersOfRow = [],
					availableNumbersOfColumn = [],

					foundNumber = 0,

					randomizeResult = {},
					currentRow = [];

				for (rowLength = _boardMatrix.length; rowIndex < rowLength; rowIndex++) { // parse rows
					availableNumbersOfRow = [1, 2, 3, 4, 5, 6, 7, 8, 9];
					randomNumbersOfRow = [];
					currentRow = _boardMatrix[rowIndex];
					_backtrackWarnings = [];
					cellIndex = 0;

					JOB.log('parsing row ' + rowIndex + ' -----------------------');

					for (cellLength = currentRow.length; cellIndex < cellLength; cellIndex++) { // parse boxes in row
						availableNumbersOfColumn = [1, 2, 3, 4, 5, 6, 7, 8, 9];

						if (rowIndex > 0) { // if this is the second row or further
							//build index of numbers used sofar in this column
							for (visitedCellIndex = (rowIndex - 1); visitedCellIndex > -1; visitedCellIndex--) {
								// remove found numbers from availableNumbersOfColumn
								foundNumber = _boardMatrix[visitedCellIndex][cellIndex];
								availableNumbersOfColumn.splice(_.indexOf(availableNumbersOfColumn, foundNumber), 1);
							}
							
							if (cellIndex === 8) { // last cell, just one number left
								randomizeResult.randomNumber = availableNumbersOfRow[0];
								randomizeResult.splicedNumbersX = [];

							} else { // cell 0-7
								randomizeResult = self.getUniqueRandomNumber(availableNumbersOfRow, availableNumbersOfColumn);
								
								JOB.log('--> ' + randomNumbersOfRow);

								if (randomizeResult.backtrack) {
									JOB.log('BACKTRACK at ' + cellIndex + ', bad no was: ' + _.last(randomNumbersOfRow) + '. _backtrackWarnings: ' + _backtrackWarnings);
									_backtrackWarnings.push(_.last(randomNumbersOfRow)); // note that the prev. number was wrong
									availableNumbersOfRow.push(_.last(randomNumbersOfRow)); // put it back as available
									randomNumbersOfRow.pop(); // remove it from current list
									cellIndex = cellIndex - 1; // step back in the row, when in the next iteration

									JOB.log('--<<<< ' + randomNumbersOfRow);

									self.fuse();

								} else {
									//_backtrackWarnings.pop();
								}
							}
							
						} else { // first row - just place the numbers
							randomizeResult = self.getUniqueRandomNumber(availableNumbersOfRow);
						
						}

						if (_backtrackWarnings.length === 0) {
							availableNumbersOfRow = randomizeResult.splicedNumbersX;
							randomNumbersOfRow.push(randomizeResult.randomNumber);	
						}

					}

					_boardMatrix[rowIndex] = randomNumbersOfRow; // set new numbers

					JOB.log('| ' + randomNumbersOfRow.join(' | ') + ' |');
				}

				JOB.log('-------------------------------------');

				//JOB.log(_boardMatrix);

			}

		},

		pub = {
			board: null,
			init: function () {
				pub.board = $(_boardSelector);
				self.placeNumbers();
			}
		};

	return pub;
}());

JOB.init = (function () {
	JOB.log = function (msg) {
		if (window.console) {
			console.log(msg);
		}
	};

	return function () {
		JOB.log('Sudoku v0.2.1');

		JOB.Sudoku.init();
	};

}());

$(JOB.init);
