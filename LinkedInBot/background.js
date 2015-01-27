
var links_to_view;
var last_link_viewed_index;

var _info = true;
var _debug = true;

var sleep_between_views_min = 1000;
var sleep_between_views_max = 1000;

function scan( lastAmount, loadTries, links ){

	debug("start scan");
	chrome.tabs.executeScript(null, {file: "pymk_scan.js"}, function(results){
		loadTries++;
		var currAmount = lastAmount;
		if( results.length > 0 )
			currAmount = results[0].length;
		else
			currAmount = results.length;
		if( currAmount == lastAmount ){
			//try again, max 5 times
			debug("found " + currAmount +" again.");
			debug("try scan again, try: " + loadTries);
			if( loadTries < 3 )
				setTimeout(function(){scan(currAmount, loadTries, links);}, 1000);
			else
				scanFinished(links);
		} else {
			//renew links, start scan over.
			debug("found new results, rescan.");
			if( results.length > 0 )
				links = results[0];
			else
				links = results;
			setTimeout( function(){scan(currAmount, 0, links);}, 1000);
		}
	});
}

function scanFinished( links ){
	info("scan finished, found: " + links.length );
	
	links_to_view = links;
	last_link_viewed_index = 0;
	
	viewNext();
}

function random(min, max){
	var dif = max - min;
	var val = min + Math.random() * dif;
	return Math.round(val);
}

function scheduleNextView(){
	var sleep = random(sleep_between_views_min, sleep_between_views_max);
	
	console.log("scheduled next view in: " + Math.round(sleep/1000) + " ms.");
	setTimeout( function(){ viewNext(); }, sleep);
}

function viewNext(){
	if( last_link_viewed_index < links_to_view.length ){
        var nextLink = links_to_view[last_link_viewed_index];
        info("view link " + (last_link_viewed_index + 1) + " of " + links_to_view.length );
        hasViewedProfile(nextLink, function(){
            console.log("Profile already viewed, go onto next one!");
            last_link_viewed_index++;
            viewNext();
        }, function(){
            console.log("Has not viewed profile, view it");
            viewURL( nextLink );
            addViewedProfile(nextLink);
            last_link_viewed_index++;
        });
	} else{
		links_to_view = null;
		last_link_viewed_index = -1;
		info("Done viewing");
	}
}

function viewURL( link ){
	chrome.tabs.create({ url: link });
	waitForTab( link, 0 );
	//wait for that url to be current
}

function waitForTab( link, tries ){
	chrome.tabs.query( {}, function( tabs ){
		var tab = findPageInArray(tabs, link);
		if( tab != null ){
			debug("page opened.");
			tabReady(link, tab.id);
		} else {
			tries++;
			if( tries < 5 ){
				//try in another second
				debug("wait for page, " + tries);
				setTimeout( function(){ waitForTab(link, tries); }, 1000);
			} else{
				//give up on this link, try the next one.
				debug("never found page, try next one.");
				scheduleNextView();
			}
		}
	});
}

function findPageInArray( tabs, link ){
	if( tabs == null )
		return null;
	for( var i = 0; i < tabs.length; i++ ){
		if( tabs[i] != null && tabs[i].url == link )
			return tabs[i];
	}
	return null;
}

function tabReady( link, tabid ){
	//scroll to the bottom of the page, and then close.
	chrome.tabs.executeScript(tabid, {code: "window.scrollTo(0,document.body.scrollHeight);"}, function(results){
		setTimeout( function(){
			chrome.tabs.remove(tabid, function(){
				debug("continue onto next url");
				scheduleNextView();
			});
		}, 1000 );
	});
}


function info( obj ){
	if( _info )
		console.log(obj);
}

function debug( obj ){
	if( _debug )
		console.log(obj);
}


//Memory of viewed profiles
function addViewedProfile( id ){
    chrome.storage.sync.get('viewedProfiles', function( items ) {
        if (items['viewedProfiles']) {
            var currString = items['viewedProfiles'];
            var newString = currString+","+id;
            chrome.storage.sync.set({'viewedProfiles': newString})
        } else {
            chrome.storage.sync.set({'viewedProfiles': id});
        }
    });
}

function hasViewedProfile( id, onViewed, onNotViewed ){
    chrome.storage.sync.get('viewedProfiles', function(items){
       if( items['viewedProfiles'] ){
           var split = items['viewedProfiles'].split(',');
           for( var i = 0; i < split.length; i++ ){
               if( split[i] == id){
                   onViewed();
                   return;
               }
           }
           onNotViewed();
       } else{
           console.log("no key");
           onNotViewed();
       }
    });
}

function printViewedProfilesString(){
    chrome.storage.sync.get('viewedProfiles', function(items){
       console.log(items['viewedProfiles']);
    });
}

function clearViewedProfiles(){
    chrome.storage.sync.set({'viewedProfiles': ''});
}

/*
chrome.pageAction.onClicked.addListener( function(tab){
	info("start scan");
	scan(-1,0,null);
});
*/
chrome.tabs.onUpdated.addListener( function(tabId,changeInfo,tab){
	if (tab.url == "https://www.linkedin.com/people/pymk") 
        chrome.pageAction.show(tabId);
    
});

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
            case "start-scan":
                console.log('start scan');
                scan(-1,0,null);
                sendResponse({});
                break;
            case "clear-data":
                console.log('clear data');
                clearViewedProfiles();
                sendResponse({});
                break;
            default:
                // helps debug when request directive doesn't match
                alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);

