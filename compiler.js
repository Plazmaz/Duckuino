	var functions = ["ALT", "GUI", "CTRL", "CONTROL", "SHIFT", "WINDOWS", "MENU", "ESC", "END", "SPACE", "TAB", "PRINTSCREEN",
									"UPARROW", "DOWNARROW", "LEFTARROW", "RIGHTARROW", "CAPSLOCK", "DELETE", "DELAY"];
	
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
		for(var j = 0; j < 12; j++) {
			line = replaceValWhereNeeded(line, "F" + j, "Keyboard.press(KEY_F" + j + ");");
		}
		for(var j = 0; j < line.split(" ").length; j++) {	//Cleanup time!
			if(functions.indexOf(line.split(" ")[j]) <= -1) {
				line = line.replace(line.split(" ")[j], "");
			}
		}
		if(isModifier)
			keysToPress = pressKeys(keysToPress.trim());
		line = replaceSpecial(line);
		if(isModifier)
			line += keysToPress + "\nKeyboard.releaseAll();";
		line = line;
		script[i] = "\t" + line;
	}
	
	var output = script.join("").trim();
	output = "void setup() {"
			 + "\n	Keyboard.begin();"
			 + "\n" + output;
	output += "Keyboard.end();"+
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
 * Insert all proper special characters on 'line'
 */
function replaceSpecial(line) {
		if(line.substr(0, 3) === "REM") {
			line = line.replace("REM ", "//");
			return line;
		}
		if(!isModifierFunction(line)) {
			line = replaceValWhereNeeded(line, "GUI", "\ntype(KEY_LEFT_GUI);");
			line = replaceValWhereNeeded(line, "WINDOWS", "\ntype(KEY_LEFT_GUI);");
			line = replaceValWhereNeeded(line, "MENU", "Mouse.press(MOUSE_LEFT);\n	Mouse.release(MOUSE_LEFT);");
			line = replaceValWhereNeeded(line, "SHIFT", "\ntype(KEY_LEFT_SHIFT);");
			line = replaceValWhereNeeded(line, "ALT", "\ntype(KEY_LEFT_ALT);");
			line = replaceValWhereNeeded(line, "CTRL", "\ntype(KEY_LEFT_CTRL);");
			line = replaceValWhereNeeded(line, "CONTROL", "\ntype(KEY_LEFT_CTRL);");
			line = replaceValWhereNeeded(line, "ESC", "\ntype(KEY_LEFT_ESC);");
			line = replaceValWhereNeeded(line, "END", "\ntype(KEY_END);");
			line = replaceValWhereNeeded(line, "SPACE", "\ntype(' ');");
			line = replaceValWhereNeeded(line, "ENTER", "\ntype(KEY_RETURN);");
			line = replaceValWhereNeeded(line, "TAB", "\ntype(KEY_TAB);");
			line = replaceValWhereNeeded(line, "PRINTSCREEN", "\ntype(206);");
			
			line = replaceValWhereNeeded(line, "UPARROW", "   type(KEY_UP_ARROW);");
			line = replaceValWhereNeeded(line, "DOWNARROW", "\ntype(KEY_DOWN_ARROW);");
			line = replaceValWhereNeeded(line, "LEFTARROW", "\ntype(KEY_LEFT_ARROW);");
			line = replaceValWhereNeeded(line, "RIGHTARROW", "\ntype(KEY_RIGHT_ARROW);");
			line = replaceValWhereNeeded(line, "CAPSLOCK", "\ntype(KEY_CAPS_LOCK);");
			line = replaceValWhereNeeded(line, "DELETE", "\ntype(KEY_DELETE);")
		} else {
			line = replaceValWhereNeeded(line, "GUI", "\npress(KEY_LEFT_GUI);");
			line = replaceValWhereNeeded(line, "WINDOWS", "\npress(KEY_LEFT_GUI);");
			line = replaceValWhereNeeded(line, "MENU", "Mouse.press(MOUSE_LEFT);\n	Mouse.release(MOUSE_LEFT);");
			line = replaceValWhereNeeded(line, "SHIFT", "\npress(KEY_LEFT_SHIFT);");
			line = replaceValWhereNeeded(line, "ALT", "\npress(KEY_LEFT_ALT);");
			line = replaceValWhereNeeded(line, "CONTROL", "\npress(KEY_LEFT_CTRL);");
			line = replaceValWhereNeeded(line, "CTRL", "\npress(KEY_LEFT_CTRL);");
			line = replaceValWhereNeeded(line, "ESC", "\npress(KEY_LEFT_ESC);");
			line = replaceValWhereNeeded(line, "END", "\npress(KEY_END);");
			line = replaceValWhereNeeded(line, "SPACE", "\npress(' ');");
			line = replaceValWhereNeeded(line, "ENTER", "\npress(KEY_RETURN);");
			line = replaceValWhereNeeded(line, "TAB", "\npress(KEY_TAB);");
			line = replaceValWhereNeeded(line, "PRINTSCREEN", "\npress(206);");
			
			line = replaceValWhereNeeded(line, "UPARROW", "\npress(KEY_UP_ARROW);");
			line = replaceValWhereNeeded(line, "DOWNARROW", "\npress(KEY_DOWN_ARROW);");
			line = replaceValWhereNeeded(line, "LEFTARROW", "\npress(KEY_LEFT_ARROW);");
			line = replaceValWhereNeeded(line, "RIGHTARROW", "\npress(KEY_RIGHT_ARROW);");
			line = replaceValWhereNeeded(line, "CAPSLOCK", "\npress(KEY_CAPS_LOCK);");
			line = replaceValWhereNeeded(line, "DELETE", "\npress(KEY_DELETE);")

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
				keyStr += "\n" + functions[i];
			}
		}
		keys = keys.replace(/\\/g, "\\\\");
		keys = keys.replace(/"/g, "\\\"");
		if(!hasFoundSpecial) {
			keyStr += "\npress('" + keys + "');";
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
	return functions.indexOf(line.split(" ")[0]) != -1;
}
//A similar function to replaceValWhereNeeded, but surrounding arguments with parentheses and adding ';\n' 
function replaceFunctionWhereNeeded(line, orig, funcname) {
	if(line.indexOf(orig) == -1)
		return line;
	var outputVal = "\n" + line.replace(orig, funcname + "(");
	outputVal += ");";
	return outputVal;
}

