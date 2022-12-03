# Timespace

## Features

This extension simply show UTC time, and your locale time in your status bar.

## Requirements

This extension has dependencies down below;

-   day.js

## Extension Settings

Installation is easy. _Just Install_.

-   Find `TimeSpace` in market place
-   Just install

then, You will see a information message Like,  
![figure1](./readme_assets/after-install.png)

Also you can see time block in your down status bar.  
![figure2](./readme_assets/timespace-activated.png)

Format and copy format setting  
You can change in `settings.json` like down blow.

```json
// Default format : `YYYY-MM-DD HH:mm:ss`
// All optional.
"timeSpace.formatUTC": "YYYY-MM-DD HH:mm:ss",
"timeSpace.formatLocale": "YYYY-MM-DD h:mm:ss A",
"timeSpace.copyFormatUTC": "YYYY-MM-DD HH:mm:ss",
"timeSpace.copyFormatLocale": "YYYY-MM-DD HH:mm:ss"
```

## Release Notes

### `0.0.1`

Initial release of TimeSpace

-   Show UTC, and Locale time YYYY-MM-DD hh:mm:ss

<br/>

### `0.0.2`

Icon Added.

![icon](./icon.png)

<br/>

### `0.1.0` Released!!!

Format and Copy feature supported.  
Default format : `YYYY-MM-DD HH:mm:ss`

From now on, you can set format as you want.

You can change in `settings.json`

```json
"timeSpace.formatUTC": "YYYY-MM-DD HH:mm:ss",
"timeSpace.formatLocale": "YYYY-MM-DD h:mm:ss A",
"timeSpace.copyFormatUTC": "YYYY-MM-DD HH:mm:ss",
"timeSpace.copyFormatLocale": "YYYY-MM-DD HH:mm:ss"
```

Especially, copy format support unix epoch timestamp, if you want, set like down below;

```json
"timeSpace.copyFormatUTC": "unix-ms", // ms is milliseconds
"timeSpace.copyFormatLocale": "unix-s" // s is seconds
```

Copy feature is very simple. Just click.

### `0.1.1`

Fix parameter description Typo issue in setting panel in VS code

## Known Issues

[0.1.0] : Parameter description typo issue - Fixed 0.1.1 version.

## For more information

Developer : [Phantola](https://github.com/phantola)
