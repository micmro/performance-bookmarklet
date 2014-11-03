Performance Bookmarklet
=======================

Bookmarklet to analyze the current page through on the [Resource Timing API](http://www.w3.org/TR/resource-timing) , [Navigation Timing API](http://www.w3.org/TR/navigation-timing) and [User-Timing](http://www.w3.org/TR/user-timing/) - requests by type, domain, load times, marks and more. Sort of a light live WebPageTest.

Just add this into the URL section of a new bookmark:

```
javascript:(function(){var el=document.createElement('script');el.type='text/javascript';el.src='https://nurun.github.io/performance-bookmarklet/dist/performanceBookmarklet.min.js';document.getElementsByTagName('body')[0].appendChild(el);})();
```



DOM Output
----------

### Navigation Timing API Waterfall

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/perfbook-navigation-timing-waterfall.png "screenshot of navigation timing API waterfall output of bookmarklet on http://walmart.ca/en")

- It also displays marker if you're setting marks with the [User Timing API](http://www.w3.org/TR/user-timing)
- hover over the bars to get the excact Milliseconds


### Resource analysis

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/perfbook-requests-pie-charts.png "screenshot of pie graph output of bookmarklet on http://velocityconf.com/velocityny2014")

- Requests by domain - handy to find out how many requests are added by 3rd parties
- Requests by Type - what content type is accountable for the majority of requests


### Resource Timing API with Markers

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/perfbook-resources-timing-waterfall.png "screenshot of resource timing API waterfall output of bookmarklet on http://stylify.me")

- The small bars inside the resource bar represent the different stages of the request (redirect, domainLookup, connect, secureConnect, requestToResponseStart, response), but are mostly not available for cross domain requests.
- The resource bar colours visualize the initiatorType

	| Type  	| Colour 	| HEX 		|
	| ----------| ----------|---------- |
	| css	  	| green 	| #c5efaf 	|
	| iframe	| blue 		| #85b3f2 	|
	| img	  	| purple 	| #c98dfd 	|
	| script 	| orange 	|  #feb06a 	|
	| link	  	| gray 		|  #6c7385 	|
	| xmlhttprequest | yellow | #efef70 |
	| other	  	| light gray  | #d6d6d7 |



Console Output
--------------

The bookmarklet also outputs various console tables (in chrome) to analyze the data in detail:

The *All loaded ressources* console table for instance contains the following data:
- Name
- Domain
- File Extension
- Initiator Type (Content Type)
- Load Time
- *Request Start Delay*
- *DNS Lookup*
- *TCP*
- *Time To First Byte*
- *SSL*
- *Request Duration*

(*some data* is not always available)

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/perfbook-tables-resources.png "tabular output in console of all resources in the page")


Requests by domain and distribution of requests' content types (local vs external):

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/perfbook-tables-file-type.png "two tables with resources type count globally and but local / external")

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/perfbook-tables-request-by-domain.png "tables with requests by domain")



How to use this snippet
-----------------------

You can use it as bookmarklet. Mozilla has a [step by step description](https://support.mozilla.org/en-US/kb/bookmarklets-perform-common-web-page-tasks#w_how-do-i-install-a-bookmarklet) on how to add a bookmarklet.

```
javascript:(function(){var el=document.createElement('script');el.type='text/javascript';el.src='https://nurun.github.io/performance-bookmarklet/dist/performanceBookmarklet.min.js';document.getElementsByTagName('body')[0].appendChild(el);})();
```

Or alternatifly just copy and paste the content of [resourceTable.js](https://raw.githubusercontent.com/nurun/resourceTable/master/resourceTable.js) to your browser console and off you go.

**You need to fall back to the copy and paste version for sites that block external scripts in their Content Security Policy directives.**



Read more
-----------
- [Introduction to Resource Timing API](http://googledevelopers.blogspot.ca/2013/12/measuring-network-performance-with.html)
- [Resource Timing API Browser Support](http://caniuse.com/#feat=resource-timing)
- [HTML5 Rocks: Measuring Page Load Speed with Navigation Timing](http://www.html5rocks.com/en/tutorials/webperformance/basics)
