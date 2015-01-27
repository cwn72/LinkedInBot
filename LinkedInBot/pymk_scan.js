
window.scrollTo(0,document.body.scrollHeight);

var elements = document.getElementsByClassName("title");
var links = new Array();

for( var i = 0; i < elements.length; i++ ){
	var href = elements[i].getAttribute("href");
	if( href != null )
		links.push(href);
}

links;

