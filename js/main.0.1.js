/*jslint devel: true, browser: true, sloppy: true, eqeq: true, plusplus: true, maxerr: 100, indent: 4, nomen: true */

var JOB = JOB || {};

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

		self = {
			randomNumber: function () {
				return Math.ceil(Math.random() * 9);
			},

			/*
			
			Effektivisera getUniqueRandomNumber:

			- slumpa bara mellan nummer i en array, inte nummer i sig
			- slumpa bara mellan de nummer som finns kvar. DVS ha 1-9 i en array och ta bort numret som blivit valt
				- skicka in antal kvarvarande nummer som seed-siffra

			 */

			getUniqueRandomNumber: function (usedNumbersX, usedNumbersY) {
				var newNumber = self.randomNumber(),
					iterations = 0,
					iterationsHaltAt = 200;

				if (usedNumbersY === undefined) { // check only one dimension
					while (_.indexOf(usedNumbersX, newNumber) > -1) {
						newNumber = self.randomNumber();
						iterations++;
					}
					//JOB.log('checking ' + newNumber + ' vs ' + usedNumbersX.join('-') + ', iterations: ' + iterations);
					
				} else {
					while (((_.indexOf(usedNumbersX, newNumber) > -1) || (_.indexOf(usedNumbersY, newNumber) > -1)) && iterations < iterationsHaltAt) {
						newNumber = self.randomNumber();
						iterations++;
					}

					//JOB.log('checking ' + newNumber + ' vs ' + usedNumbersX.join('-') + ' / ' + usedNumbersY.join('-') + ', iterations: ' + iterations);

					if (iterations === iterationsHaltAt) {
						JOB.log('ITERATION HALTED AT ' + iterations);
					}
				}

				//JOB.log('found random nr, ' + newNumber + ', after ' + iterations + ' iterations');
				return newNumber;
			},

			placeNumbers: function () {
				var rowIndex = 0,
					rowLength = 0,
					cellIndex = 0,
					cellLength = 0,
					visitedCellIndex = 0,

					usedNumbersOfRow = [],
					usedNumbersOfColumn = [],
					
					randomizeResult = 0,
					currentRow = [];

				//return 'TEMPSTOP';

				for (rowLength = _boardMatrix.length; rowIndex < rowLength; rowIndex++) { // parse rows
					usedNumbersOfRow = [];
					currentRow = _boardMatrix[rowIndex];
					cellIndex = 0;

					JOB.log('parsing row ' + rowIndex + ' -----------------------');

					for (cellLength = currentRow.length; cellIndex < cellLength; cellIndex++) { // parse boxes in row
						usedNumbersOfColumn = [];

						if (rowIndex > 0) { // if this is the second row or further
							//build index of numbers used sofar in this column
							for (visitedCellIndex = (rowIndex - 1); visitedCellIndex > -1; visitedCellIndex--) {
								usedNumbersOfColumn.push(_boardMatrix[visitedCellIndex][cellIndex]);
							}
							//JOB.log('usedNumbersOfColumn: ' + usedNumbersOfColumn);
							// check random no against board column
							randomizeResult = self.getUniqueRandomNumber(usedNumbersOfRow, usedNumbersOfColumn);

							usedNumbersOfRow.push(randomizeResult);

						} else {
							// first row - just place the numbers
							randomizeResult = self.getUniqueRandomNumber(usedNumbersOfRow);
							usedNumbersOfRow.push(randomizeResult);
						}

					}

					_boardMatrix[rowIndex] = usedNumbersOfRow; // set new numbers

					JOB.log('| ' + usedNumbersOfRow.join(' | ') + ' |');
				}

				JOB.log('-------------------------------------');

				JOB.log(_boardMatrix);

			}

		},

		pub = {
			board: null,
			setup: function () {
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
		JOB.log('Sudoku v0.1.3');

		JOB.Sudoku.setup();
	};

}());

$(JOB.init);
