
var links_to_view;
var last_link_viewed_index;

var _info = true;
var _debug = true;

//Between profile views
var sleep_1_1 = 1000 * 20;
var sleep_1_2 = 1000 * 30;
//Before opening experience
var sleep_2_1 = 1000 * 5;
var sleep_2_2 = 1000 * 15;
//Before closing profile
var sleep_3_1 = 1000 * 30;
var sleep_3_2 = 1000 * 40;

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
	var sleep = random(sleep_1_1, sleep_1_2);
	
	console.log("scheduled next view in: " + Math.round(sleep/1000) + " s.");
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
            viewURL( nextLink, tabReady, scheduleNextView );
            addViewedProfile(nextLink);
            last_link_viewed_index++;
        });
	} else{
		links_to_view = null;
		last_link_viewed_index = -1;
		info("Done viewing");
	}
}

function viewURL( link, tabReady, tabFailed ){
	chrome.tabs.create({ url: link });
	waitForTab( link, 0, tabReady, tabFailed );
	//wait for that url to be current
}

function waitForTab( link, tries, tabReady, tabFailed ){
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
				setTimeout( function(){ waitForTab(link, tries, tabReady, tabFailed); }, 1000);
			} else{
				//give up on this link, try the next one.
				debug("never found page, try next one.");
				tabFailed();
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
    chrome.tabs.executeScript(tabid, {file: 'profileViewer.js'}, function(results){
       //View a random site in 5-15 seconds.
       //Stay on that page 30-45 seconds.
       //Close both pages
        if( results[0] ){
            //found possible experiences
            var t1 = random(sleep_2_1, sleep_2_2);
            console.log("Open experience page in " + (t1/1000) + " s.");
            setTimeout( function(){
                //Open new page
                var experienceLink = results[0][random(0,results[0].length-1)];
                debug("View experience link: " + experienceLink);
                chrome.tabs.create({ url: experienceLink });
                var t2 = random(sleep_3_1, sleep_3_2);
                console.log("Finished viewing in " + (t2/1000) + " s.");
                waitForTab( experienceLink, 0, function( _link, _tabid){
                    setTimeout( function(){
                        chrome.tabs.remove(_tabid);
                        chrome.tabs.remove(tabid, function(){
                            debug("Continue onto next url");
                            closeExtraTabs();
                            scheduleNextView();
                        })
                    }, t2 );
                } );
            }, t1 );
        } else {
            console.log("no results returned from script, move on to next profile.");
            closeExtraTabs();
            scheduleNextView();
        }

    });
}

function closeExtraTabs(){
    chrome.tabs.query( {}, function( tabs ){
       for( var i = 0; i < tabs.length; i++ ){
           if( tabs[i].url.indexOf('linkedin') != -1 && tabs[i].url.indexOf('/people/pymk') == -1 ){
               chrome.tabs.remove(tabs[i].id);
           }
       }
    });
}

function viewProfileAdvanced(){

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
    chrome.storage.local.get('viewedProfiles', function( items ) {
        if (items['viewedProfiles']) {
            var currString = items['viewedProfiles'];
            var newString = currString+","+id;
            chrome.storage.local.set({'viewedProfiles': newString})
        } else {
            chrome.storage.local.set({'viewedProfiles': id});
        }
    });
}

function hasViewedProfile( id, onViewed, onNotViewed ){
    chrome.storage.local.get('viewedProfiles', function(items){
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
    chrome.storage.local.get('viewedProfiles', function(items){
       console.log(items['viewedProfiles']);
    });
}

function clearViewedProfiles(){
    chrome.storage.local.set({'viewedProfiles': ''});
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
            case "test":
                console.log('test');

                sendResponse({});
                break;
            default:
                // helps debug when request directive doesn't match
                alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);

