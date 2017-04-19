# `grawlix`: Errors

__Contents__
- [Introduction](#introduction)
- [Class: grawlix.error.GrawlixFilterError](#class-grawlixerrorgrawlixfiltererror)
- [Class: grawlix.error.GrawlixPluginError](#class-grawlixerrorgrawlixpluginerror)
- [Class: grawlix.error.GrawlixStyleError](#class-grawlixerrorgrawlixstyleerror)

***

## Introduction

To help in debugging issues related to the package, `grawlix` throws three custom [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) subclasses that include extra information about the exception.

## Class: grawlix.error.GrawlixFilterError

Used for errors related to filters and filter objects. In addition to what it inherits from `Error`, `GrawlixFilterError` has the following properties:

### filter

Type: `Object`<br>
Default: `null`

The filter or filter object that threw the error.

### plugin

Type: `Object`<br>
Default: `null`

The plugin that the filter object belongs to, if applicable. Will be `null` if the filter object was provided through the main `grawlix` options.

## Class: grawlix.error.GrawlixPluginError

Used for errors relating to plugins. In addition to what it inherits from `Error`, `GrawlixPluginError` has the following properties:

### plugin

Type: `Object`<br>
Default: `null`

The plugin or plugin object that threw the error.

## Class: grawlix.error.GrawlixStyleError

Used for errors related to `grawlix` styles and style objects. In addition to what it inherits from `Error`, `GrawlixStyleError` has the following properties:

### styleName

Type: `String`<br>
Default: `null`

The name of the style or the style object that threw the error.

### style

Type: `Object`<br>
Default: `null`

The style or the style object that threw the error.

### plugin

Type: `Object`<br>
Default: `null`

The plugin that the style or style object belongs to, if applicable. Will be `null` if the style object was provided through the main `grawlix` options.

***

*Last updated April 18, 2017.*
