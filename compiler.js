	var functions = ["ALT", "GUI", "CTRL", "CONTROL", "SHIFT", "WINDOWS", "COMMAND", "MENU", "ESC", "END", "SPACE", "TAB", "PRINTSCREEN", "ENTER",
									"UPARROW", "DOWNARROW", "LEFTARROW", "RIGHTARROW", "CAPSLOCK", "DELETE"];
	var mappings = ["KEY_LEFT_ALT", "KEY_LEFT_GUI", "KEY_LEFT_CTRL", "KEY_LEFT_CTRL", "KEY_LEFT_SHIFT", "KEY_LEFT_GUI", "KEY_LEFT_GUI", "229", 
	"KEY_LEFT_ESC", "KEY_END", "' '", "KEY_TAB", "206", "KEY_RETURN", "KEY_UP_ARROW", "KEY_DOWN_ARROW", "KEY_LEFT_ARROW", "KEY_RIGHT_ARROW", "KEY_CAPS_LOCK", "KEY_DELETE"]; 
														  //the 229 is due to
													      //arduino's conversion method, it's the mapping
														  //for key code 93 or the menu key.
														  //The same concept applies to 206 and the printscreen key.
function parseScript(){
	var input = document.getElementById("duckyscript").value;
	var lines = input.toUpperCase().split('\n');
	lines = cleanDuplicateFunctions(lines);
	var outputLines = [];
	for(var i = 0; i < lines.length; i++) {
		var line = lines[i].trim();
		var firstWord = line.split(" ",1)[0];
		
		switch(firstWord) {
			case "STRING": {
				line = printKeys(line.replace(" ", "").substr(6));
				outputLines[i] = line;
				break;
			};
			case "DELAY": {
				line = replaceFunctionWhereNeeded(line, "DELAY ", "delay");
				outputLines[i] = line;
				break;
			};
			case "REM": {
				line = line.replace("REM ", "//");
				outputLines[i] = line;
				break;
			}
		}
		if(firstWord === "STRING" || firstWord === "DELAY" || firstWord === "REM")
			continue;
		line = line.replace(/ F([0-9]{1,2})([$\s])/g, "Keyboard.press(KEY_F$1);$2" );
		var isModifier = functions.indexOf(firstWord) > -1;
		var keysToPress = JSON.parse(JSON.stringify(line));
		for(var j = 0; j <= functions.length; j++) {
			keysToPress = keysToPress.replace(functions[j], "");
		}
		if(isModifier)
			keysToPress = pressKeys(keysToPress);
		line = insertFunctions(line);
		
		if(isModifier) {
			line = line.split(" ")[0] + keysToPress + "\nKeyboard.releaseAll();";
		}
		outputLines[i] = "    " + line;
	}
	var output = outputLines.join("\n");
	output = "\n/* Converted by Duckuino:"
			 +"\n* https://forums.hak5.org/index.php?/topic/32719-payload-converter-duckuino-duckyscript-to-arduino/?p=244590"
			 +"\n* Enjoy!"
			 +"\n*/"
			 + "\nvoid setup() {"
			 + "\n	Keyboard.begin();"
			 + "\n" + output;
	output += "\nKeyboard.end();"+
				"\n}";
	output +="\nvoid type(int key, boolean release) {"
			 + "\n	Keyboard.press(key);"
			 +"\n	if(release)"
			 + "\n		Keyboard.release(key);"
			 +"\n}";
	 output +="\nvoid print(const __FlashStringHelper *value) {"	//This is used to reduce the amount of memory strings take.
		 		+"\n	Keyboard.print(value);"
				+"\n}";
	
	output +="\nvoid loop(){}"
	document.getElementById("arduinoout").textContent = output;
}
/*
 * Insert all proper functions on 'line'
 */
function insertFunctions(line) {
		var firstWord = line.split(" ",1)[0];
		if(functions.indexOf(firstWord) == -1) {
			for(var i = 0; i < mappings.length; i++) {	//not functions.length so we don't deal with delay here.
				line = replaceValWhereNeeded(line, functions[i], "\ntype(" + mappings[i] + ",false);");
			}
		} else {
			for(var i = 0; i < mappings.length; i++) {	//not functions.length so we don't deal with delay here.
				line = replaceValWhereNeeded(line, functions[i], "\ntype(" + mappings[i] + ",false);");
			}

		}
		return line
}
//Press and release keys
function typeKeys(keys) {
		var keyStr = "";
		if(keys === '') { //Just to be sure.
			return "";
		}
		for(var i = 0; i < keys.length; i++) {
			if(keys.charAt(i) == ' ')
				continue;
			keyStr += i != 0 ? "\n" : "";
			keyStr += "\n 	type(" + keys.charCodeAt(i) + ",true);";
		}
		return keyStr;
}
//Press and release keys to form a string
function printKeys(keys) {
		var keyStr = "";
		keys = keys.replace(/\\/g, "\\\\");
		keys = keys.replace(/"/g, "\\\"");
		keyStr = "\nprint(F(\""+keys+"\"));"
		return keyStr;
}
//Press a key down, but don't release it just yet
function pressKeys(keys) {
		if(keys === keys.trim()) { //Just to be sure.
			return "";
		}
		var keyStr = "";
		var hasFoundSpecial = false;
		for(var i = 0; i < functions.length; i++) {
			if(keys.indexOf(functions[i]) != -1) {
				keys = keys.replace(functions[i], "");
				hasFoundSpecial = true;
				console.log("Found special!");
				keyStr += "\n" + functions[i];
			}
		}
		keys = keys.replace(/\\/g, "\\\\");
		keys = keys.replace(/"/g, "\\\"");
		if(keys.charAt(1) == '')
			return keyStr;
		if(!hasFoundSpecial) {
			keyStr += "\ntype('" + keys.charAt(1) + "',false);";
		}
		return keyStr;
}
//Check if value exists in line, if so, replace it
function replaceValWhereNeeded(line, orig, replacement) {
	if(line.indexOf(orig) == -1) 
		return line;
	return line.replace(orig, replacement);
}
//A similar function to replaceValWhereNeeded, but surrounding arguments with parentheses and adding ';\n' 
function replaceFunctionWhereNeeded(line, orig, funcname) {
	if(line.indexOf(orig) == -1)
		return line;
	var outputVal = line.replace(orig, funcname + "(");
	outputVal += ");";
	return outputVal;
}
function cleanDuplicateFunctions(lines) {
	var tmpLines = lines;
	var blocks = generateFunctionBlocks(tmpLines);
	for(var i = 0; i < blocks.length; i++) {
		tmpLines.splice(blocks[i].index, blocks[i].length, "for(int i = 0; i < "+blocks[i].length + "; i++) { ", blocks[i].func, "}");
	}
	return tmpLines;
}
function generateFunctionBlocks(lines) {
	var tmpLines = lines;
	var blocks = [];
	for(var i = 0; i < tmpLines.length-1; i++) {
		if(tmpLines[i+1] === tmpLines[i]) {
			var block = blockFactoryGo();
			block.index = i;
			var blockLen = 1;
			while(tmpLines[i+blockLen] === tmpLines[i]) {
				blockLen++;
			}
			block.func = tmpLines[i];
			block.length = blockLen;
			blocks.push(block);
			i+=blockLen;
		}
	}
	return blocks;
}
function blockFactoryGo() {
	var block = {
		func: "",
		index: 0,
		length: 0
	}
	return block
}
