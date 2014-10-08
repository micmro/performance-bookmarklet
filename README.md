Resource Timing API - resourceTable
===================================

Snippet to lists all resources from the [Resource Timing API](http://www.w3.org/TR/resource-timing/) with load times (inspired by [this article from Steve Souders](http://www.stevesouders.com/blog/2014/08/21/resource-timing-practical-tips/)), in a table in the console.

You can use it as bookmarklet:

```
javascript:(function(){var el=document.createElement('script');el.type='text/javascript';el.src='//nurun.github.io/resourceTable/resourceTable.js';document.getElementsByTagName('body')[0].appendChild(el);})();
```

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/screenshot-bookmarklet.png "screenshot of pie graph output of bookmarklet")



The table contains the following data:
- name
- domain
- fileExtension
- loadtime
- *requestStart*
- *dns*
- *tcp*
- *ttfb*
- *ssl*

(*some data* is not always available)

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-tables-ressources.png "tabular output of all ressources in the page")


It also prints out a table counting the number of filetypes and filetypes local vs external as well as requests by domain.


![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-tables-file-type.png "two tables with ressources type count globally and but local / external")

![alt text](https://raw.githubusercontent.com/nurun/resourceTable/gh-pages/readme-assets/resourceTable-tables-request-by-domain.png "tables with requests by domain")


How to use this snippet
-----------------------

You can use it as bookmarklet

```
javascript:(function(){var el=document.createElement('script');el.type='text/javascript';el.src='//nurun.github.io/resourceTable/resourceTable.js';document.getElementsByTagName('body')[0].appendChild(el);})();
```

Or alternatifly just copy and paste the content of [resourceTable.js](https://raw.githubusercontent.com/nurun/resourceTable/master/resourceTable.js) in your browser console and off you go.

You might need to do the copy and paste version for pages that block external scripts in their Content Security Policy directives.


Resource Timing API 
--------------------
- [Introduction](http://googledevelopers.blogspot.ca/2013/12/measuring-network-performance-with.html)
- [Browser Support](http://caniuse.com/#feat=resource-timing)