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
	var script = input.split('\n');
	for(var i = 0; i < script.length; i++) {
		var line = script[i];
		var isModifier = isModifierFunction(script[i]);
		line = line.replace("\n", "").trim();
		var keysToPress = JSON.parse(JSON.stringify(line));
		for(var j = 0; j <= functions.length; j++) {
			keysToPress = keysToPress.replace(functions[j], "");
		}
		if(line.substr(0, 6) === "STRING") {
			line = printKeys(line.replace(" ", "").substr(6));
			script[i] = line;
			continue;
		};
		if(line.substr(0, 5) === "DELAY") {
			line = replaceFunctionWhereNeeded(line, "DELAY ", "delay");
			script[i] = line;
			continue;
		};
		if(line.substr(0, 3) === "REM") {
			line = line.replace("REM ", "//");
			script[i] = line;
			continue;
		}
		for(var j = 0; j < 12; j++) {
			line = replaceValWhereNeeded(line, "F" + j, "Keyboard.press(KEY_F" + j + ");");
		}
		/*for(var j = 0; j < line.split(" ").length; j++) {	//Cleanup time! here we're removing all functions that aren't inserted by us
			if(functions.indexOf(line.split(" ")[j]) <= -1) {
				line = line.replace(line.split(" ")[j], "");
			}
		}*/
		if(isModifier)
			keysToPress = pressKeys(keysToPress);
		line = insertFunctions(line);
		
		if(isModifier)
			line += keysToPress + "\nKeyboard.releaseAll();";
		script[i] = "    " + line;
	}
	
	var output = script.join("\n");
	output = "\n/* Converted by Duckuino:"
			 +"\n* https://forums.hak5.org/index.php?/topic/32719-payload-converter-duckuino-duckyscript-to-arduino/?p=244590"
			 +"\n* Enjoy!"
			 +"\n*/"
			 + "\nvoid setup() {"
			 + "\n	Keyboard.begin();"
			 + "\n" + output;
	output += "\nKeyboard.end();"+
				"\n}";
	output +="\nvoid type(int key) {"
			 + "\n	Keyboard.press(key);"
			 + "\n	Keyboard.release(key);"
			 +"\n}";
	output +="\nvoid press(int key) {"
			 + "\n	Keyboard.press(key);"
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
		if(!isModifierFunction(line)) {
			for(var i = 0; i < mappings.length; i++) {	//not functions.length so we don't deal with delay here.
				line = replaceValWhereNeeded(line, functions[i], "\ntype(" + mappings[i] + ");");
			}
		} else {
			for(var i = 0; i < mappings.length; i++) {	//not functions.length so we don't deal with delay here.
				line = replaceValWhereNeeded(line, functions[i], "\npress(" + mappings[i] + ");");
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
			keyStr += "\n 	type(" + keys.charCodeAt(i) + ");";
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
//Press a key down, but don't release it yet
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
			keyStr += "\npress('" + keys.charAt(1) + "');";
		}
		return keyStr;
}
//Check if value exists in line, if so, replace it
function replaceValWhereNeeded(line, orig, replacement) {
	if(line.indexOf(orig) == -1) 
		return line;
	return line.replace(orig, replacement);
}
function isModifierFunction(line) {
	return functions.indexOf(JSON.parse(JSON.stringify(line)).trim().split(" ")[0]) != -1;
}
//A similar function to replaceValWhereNeeded, but surrounding arguments with parentheses and adding ';\n' 
function replaceFunctionWhereNeeded(line, orig, funcname) {
	if(line.indexOf(orig) == -1)
		return line;
	var outputVal = "\n" + line.replace(orig, funcname + "(");
	outputVal += ");";
	return outputVal;
}

