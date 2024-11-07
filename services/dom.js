const { Window } = require("happy-dom");
global.fetch = require("cross-fetch");

global.window = new Window();
global.document = window.document;