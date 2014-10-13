Resource Timing API - resourceTable
===================================

Bookmarklet to lists all resources from the [Resource Timing API](http://www.w3.org/TR/resource-timing/) with load times etc (inspired by [this article from Steve Souders](http://www.stevesouders.com/blog/2014/08/21/resource-timing-practical-tips/) and the [Waterfall Bookmarklet](https://github.com/andydavies/waterfall)), in a table in the console and in a pie chart on the page.

Just add this into the URL section of a new bookmark:

```
javascript:(function(){var el=document.createElement('script');el.type='text/javascript';el.src='//nurun.github.io/resourceTable/resourceTable.js';document.getElementsByTagName('body')[0].appendChild(el);})();
```


![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-bookmarklet-pies.png "screenshot of pie graph output of bookmarklet")
Screenshot of bookmarklet run on [http://velocityconf.com/velocityny2014](http://velocityconf.com/velocityny2014)



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

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-tables-resources.png "tabular output of all resources in the page")


It also outputs a table and pie chart listing the distribution of requests' content types (local vs external) as well as requests by domain:

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-tables-file-type.png "two tables with resources type count globally and but local / external")

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-tables-request-by-domain.png "tables with requests by domain")


How to use this snippet
-----------------------

You can use it as bookmarklet. Mozilla has a [step by step description](https://support.mozilla.org/en-US/kb/bookmarklets-perform-common-web-page-tasks#w_how-do-i-install-a-bookmarklet) on how to add a bookmarklet.

```
javascript:(function(){var el=document.createElement('script');el.type='text/javascript';el.src='//nurun.github.io/resourceTable/resourceTable.js';document.getElementsByTagName('body')[0].appendChild(el);})();
```

Or alternatifly just copy and paste the content of [resourceTable.js](https://raw.githubusercontent.com/nurun/resourceTable/master/resourceTable.js) in your browser console and off you go.

**You might need to do the copy and paste version for pages that block external scripts in their Content Security Policy directives.**


Read more
-----------
- [Introduction to Resource Timing API](http://googledevelopers.blogspot.ca/2013/12/measuring-network-performance-with.html)
- [Resource Timing API Browser Support](http://caniuse.com/#feat=resource-timing)