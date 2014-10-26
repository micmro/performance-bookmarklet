Resource Timing API - resourceTable
===================================

Bookmarklet to analyze the current page through on the [Resource Timing API](http://www.w3.org/TR/resource-timing) and [Navigation Timing API](http://www.w3.org/TR/navigation-timing) - requests by type, domain, load times and more.

Just add this into the URL section of a new bookmark:

```
javascript:(function(){var el=document.createElement('script');el.type='text/javascript';el.src='//nurun.github.io/resourceTable/dist/resourceTable.min.js';document.getElementsByTagName('body')[0].appendChild(el);})();
```

DOM Output
----------


![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-bookmarklet-navigation-timing.png "screenshot of navigation timing output of bookmarklet")

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-bookmarklet-pies.png "screenshot of pie graph output of bookmarklet")
*Screenshot of bookmarklet run on [http://velocityconf.com/velocityny2014](http://velocityconf.com/velocityny2014)*


Console Output
--------------

The *All loaded ressources* console table contains the following data:
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

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-tables-resources.png "tabular output in console of all resources in the page")


Requests by domain and distribution of requests' content types (local vs external):

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-tables-file-type.png "two tables with resources type count globally and but local / external")

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-tables-request-by-domain.png "tables with requests by domain")


How to use this snippet
-----------------------

You can use it as bookmarklet. Mozilla has a [step by step description](https://support.mozilla.org/en-US/kb/bookmarklets-perform-common-web-page-tasks#w_how-do-i-install-a-bookmarklet) on how to add a bookmarklet.

```
javascript:(function(){var el=document.createElement('script');el.type='text/javascript';el.src='//nurun.github.io/resourceTable/dist/resourceTable.min.js';document.getElementsByTagName('body')[0].appendChild(el);})();
```

Or alternatifly just copy and paste the content of [resourceTable.js](https://raw.githubusercontent.com/nurun/resourceTable/master/resourceTable.js) to your browser console and off you go.

**You need to fall back to the copy and paste version for sites that block external scripts in their Content Security Policy directives.**


Read more
-----------
- [Introduction to Resource Timing API](http://googledevelopers.blogspot.ca/2013/12/measuring-network-performance-with.html)
- [Resource Timing API Browser Support](http://caniuse.com/#feat=resource-timing)
- [HTML5 Rocks: Measuring Page Load Speed with Navigation Timing](http://www.html5rocks.com/en/tutorials/webperformance/basics)