/*
var companyNames = $("#background-experience").children("div").children("div").children("header").children("h5").children("a");
var jobTitles = $("#background-experience").children("div").children("div").children("header").children("h4").children("a");
*/

function getCompanyNameHrefs(){
    var divs1 = document.getElementById("background-experience").getElementsByTagName("div");
    var divs2 = childrenByTag( divs1, "div");
    var headers = childrenByTag( divs2, "header");
    var h5s = childrenByClass( headers, "experience-logo" );
    var as = childrenByTag(h5s, "a");
    return getHrefs(as);

}

function getJobTitleHrefs(){
    var divs1 = document.getElementById("background-experience").getElementsByTagName("div");
    var divs2 = childrenByTag( divs1, "div");
    var headers = childrenByTag( divs2, "header");
    var h4s = childrenByTag(headers, "h4");
    var as = childrenByTag(h4s, "a");
    return getHrefs(as);
}

function getSearchableHrefs(){
    var hrefs = [];
    var jobTitleHrefs = getJobTitleHrefs();
    var companyNameHrefs = getCompanyNameHrefs();
    for( var i = 0; i < jobTitleHrefs.length; i++ )
        hrefs[hrefs.length] = "https://www.linkedin.com/" + jobTitleHrefs[i];
    for( var i = 0; i < companyNameHrefs.length; i++ )
        hrefs[hrefs.length] = "https://www.linkedin.com/" + companyNameHrefs[i];
    return hrefs;
}


function childrenByTag( objs, tag ){
    var ret = [];
    for( var i = 0; i < objs.length; i++ ){
        if( objs[i] == null )
            continue;
        curr = objs[i].getElementsByTagName(tag);
        for( var h = 0; h < curr.length; h++ ){
            ret[ret.length] = curr[h];
        }
    }
    return ret;
}

function childrenByClass( objs, cls ){
    var ret = [];
    for( var i = 0; i < objs.length; i++ ){
        if( objs[i] == null )
            continue;
        curr = objs[i].getElementsByClassName(cls);
        for( var h = 0; h < curr.length; h++ ){
            ret[ret.length] = curr[h];
        }
    }
    return ret;
}

function getHrefs( objs ){
    var ret = [];
    for( var i = 0; i < objs.length; i++ ){
        ret[ret.length] = objs[i].getAttribute('href');
    }
    return ret;
}

function getClasses( objs ){
    var ret = [];
    for( var i = 0; i < objs.length; i++ ){
        ret[ret.length] = objs[i].getAttribute('class');
    }
    return ret;
}

function getIds( objs ){
    var ret = [];
    for( var i = 0; i < objs.length; i++ ){
        ret[ret.length] = objs[i].getAttribute('id');
    }
    return ret;
}



getSearchableHrefs();