var input = document.getElementById("input");

// called when the submit button is clicked
function process() {
	// for (let i = 0; i < input.files.length; i += 1) {
		var file = input.files[0]
		var reader = new FileReader();

		waitForTextReadComplete(reader);
		reader.readAsText(file);
	// }
}

// changes the reader's onloadend function so that it does stuff when it's done loading
function waitForTextReadComplete(reader) {
	reader.onloadend = function(event) {
		var text = event.target.result;
		xmlToArray(text);
	}
}

function xmlToArray(text) {
	var parser = new DOMParser()
	var xmlDom = parser.parseFromString(text, "text/xml");

	out = [];

	let colNamesXml = xmlDom.getElementsByTagName("ColumnMatchTag");
	let colNames = [];
	for (let i = 0; i < colNamesXml.length; i += 1) {
		colNames[i] = colNamesXml[i].textContent;
	}
	out[0] = colNames;

	let columns = [];
	for (let i = 0; i < colNames.length; i += 1) {
		columns[i] = xmlDom.getElementsByTagName("ColumnCells")[i].childNodes[0].nodeValue.split("\n");
	}
	console.log(columns[0]);

	for (let i = 1; i < columns[0].length; i += 1) {
		out[i] = [];
		for (let j = 0; j < colNames.length; j += 1) {
			out[i][j] = columns[j][i];
		}
	}

	console.log(out);
}

function arrayToCSV(array) {
	let outArr = [];
	for (let i = 0; i < array.length; i += 1) {
		outArr[i] = array[i].join(",");
	}
	return outArr.join("\n");
}