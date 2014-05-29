	var specialCodes = ["ALT", "GUI", "CTRL", "CONTROL", "SHIFT", "WINDOWS", "MENU", "STRING", "DELAY", "ESC", "END", "SPACE", "TAB", "PRINTSCREEN",
									"UPARROW", "DOWNARROW", "LEFTARROW", "RIGHTARROW", "CAPSLOCK", "DELETE", "ENTER"];
	
function parseScript(){
	var input = document.getElementById("duckyscript").value;
	var script = input.split('\n');
	for(var i = 0; i < script.length; i++) {
		var line = script[i];
		line = line.replace("\n", "").trim();
		for(var j = 0; j < 6; j++) {	//Only replace the first six codes
			if(line.indexOf(specialCodes[j]) != -1) {
				if(line.substr(0, specialCodes[j].length) === specialCodes[j]) {
					var keysToType = pressKeys(line.replace(" ", "").substr(specialCodes[j].length));
					var selectedCode = specialCodes[j];
					if(selectedCode === "CONTROL")		//**********************
						selectedCode = "CTRL"			//*Adding basic aliases*
					if(selectedCode === "WINDOWS")		//**********************
						selectedCode = "GUI";
					
					line = "Keyboard.press(KEY_LEFT_"+ selectedCode + ");"
					+"\n" + keysToType
					+"\n	Keyboard.releaseAll();\n";
					script[i] = line;
				}
			}
		}
		if(line.substr(0, 6) === "STRING") {
			line = pressKeys(line.replace(" ", "").substr(6));
		};
		for(var j = 0; j < 12; j++) {
			line = replaceValWhereNeeded(line, "F" + j, "Keyboard.press(KEY_F" + j + ");");
		}
		line = replaceSpecial(line);
		line += "\n";
		script[i] = "	" + line;
	}
	
	var output = script.join("");
	output = "\nvoid setup() {"
			 + "\n	Keyboard.begin();"
			 + "\n" + output;
	output += "}";
	output +="\nvoid type(int key) {"
			 + "\n	Keyboard.press(key);"
			 + "\n	Keyboard.release(key);"
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
		//line = replaceValWhereNeeded(line, "GUI", "type(KEY_LEFT_GUI);");
		line = replaceValWhereNeeded(line, "MENU", "Mouse.press(MOUSE_LEFT);\n	Mouse.release(MOUSE_LEFT);");
		//line = replaceValWhereNeeded(line, "SHIFT", "type(KEY_LEFT_SHIFT);");
		line = replaceFunctionWhereNeeded(line, "DELAY ", "delay");
		//line = replaceValWhereNeeded(line, "ALT", "type(KEY_LEFT_ALT);");
		//line = replaceValWhereNeeded(line, /[CTRL|CONTROL]/g, "type(KEY_LEFT_CTRL);");
		line = replaceValWhereNeeded(line, "ESC", "type(KEY_LEFT_ESC);");
		line = replaceValWhereNeeded(line, "END", "type(KEY_END);");
		line = replaceValWhereNeeded(line, "SPACE", "type(' ');");
		line = replaceValWhereNeeded(line, "ENTER", "type(KEY_RETURN);");
		line = replaceValWhereNeeded(line, "TAB", "type(KEY_TAB);");
		line = replaceValWhereNeeded(line, "PRINTSCREEN", "type(206);");
		
		line = replaceValWhereNeeded(line, "UPARROW", "   type(KEY_UP_ARROW);");
		line = replaceValWhereNeeded(line, "DOWNARROW", "type(KEY_DOWN_ARROW);");
		line = replaceValWhereNeeded(line, "LEFTARROW", "type(KEY_LEFT_ARROW);");
		line = replaceValWhereNeeded(line, "RIGHTARROW", "type(KEY_RIGHT_ARROW);");
		line = replaceValWhereNeeded(line, "CAPSLOCK", "type(KEY_CAPS_LOCK);");
		line = replaceValWhereNeeded(line, "DELETE", "type(KEY_DELETE);")
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
			keyStr += " 	type(" + keys.charCodeAt(i) + ");";
		}
		return keyStr;
}
//Press a key down, but don't release it yet
function pressKeys(keys) {
		if(keys === '') { //Just to be sure.
			return "";
		}
		var keyStr = "";
		var hasFoundSpecial = false;
		for(var i = 0; i < specialCodes.length; i++) {
			if(keys.indexOf(specialCodes[i]) != -1) {
				keys = keys.replace(specialCodes[i], "");
				hasFoundSpecial = true;
				keyStr += "\n" + specialCodes[i];
			}
		}
		keys = keys.replace(/\\/g, "\\\\");
		keys = keys.replace(/"/g, "\\\"");
		if(!hasFoundSpecial) {
			keyStr += "\n	print(F(\"" + keys + "\"));";
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
	var outputVal = "" + line.replace(orig, funcname + "(");
	outputVal += ");\n";
	return outputVal;
}
