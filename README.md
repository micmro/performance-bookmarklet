Resource Timing API - resourceTable
===================================

Snippet to lists all resources from the [Resource Timing API](http://www.w3.org/TR/resource-timing/) with load times (inspired by [this article from Steve Souders](http://www.stevesouders.com/blog/2014/08/21/resource-timing-practical-tips/)), in a table in the console.

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


![alt text](https://raw.githubusercontent.com/micmro/resourceTable/screenshots/readme-assets/resourceTable-tables-ressources.png "tabular output of all ressources in the page")


It also prints out a table counting the number of filetypes and filetypes local vs external as well as requests by domain.


![alt text](https://raw.githubusercontent.com/micmro/resourceTable/screenshots/readme-assets/resourceTable-tables-file-extensions.png "two tables with ressources type count globally and but local / external")

How to use this snippet
-----------------------
Just copy and paste the content of [resourceTable.js](https://raw.githubusercontent.com/micmro/resourceTable/master/resourceTable.js) in your browser console and off you go.


Resource Timing API 
--------------------
- [Introduction](http://googledevelopers.blogspot.ca/2013/12/measuring-network-performance-with.html)
- [Browser Support](http://caniuse.com/#feat=resource-timing)