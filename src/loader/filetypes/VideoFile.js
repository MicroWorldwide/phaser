/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2019 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var Class = require('../../utils/Class');
var CONST = require('../../const');
var File = require('../File');
var FileTypesManager = require('../FileTypesManager');
var GetFastValue = require('../../utils/object/GetFastValue');
var IsPlainObject = require('../../utils/object/IsPlainObject');

/**
 * @classdesc
 * A single Video File suitable for loading by the Loader.
 *
 * These are created when you use the Phaser.Loader.LoaderPlugin#video method and are not typically created directly.
 * 
 * For documentation about what all the arguments and configuration options mean please see Phaser.Loader.LoaderPlugin#video.
 *
 * @class VideoFile
 * @extends Phaser.Loader.File
 * @memberof Phaser.Loader.FileTypes
 * @constructor
 * @since 3.20.0
 *
 * @param {Phaser.Loader.LoaderPlugin} loader - A reference to the Loader that is responsible for this file.
 * @param {(string|Phaser.Types.Loader.FileTypes.VideoFileConfig)} key - The key to use for this file, or a file configuration object.
 * @param {any} [urlConfig] - The absolute or relative URL to load this file from in a config object.
 * @param {Phaser.Types.Loader.XHRSettingsObject} [xhrSettings] - Extra XHR Settings specifically for this file.
 * @param {AudioContext} [audioContext] - The AudioContext this file will use to process itself.
 */
var VideoFile = new Class({

    Extends: File,

    initialize:

    //  URL is an object created by VideoFile.findAudioURL
    function VideoFile (loader, key, urlConfig, loadEvent, asBlob, xhrSettings)
    {
        var fileConfig = {
            type: 'video',
            cache: loader.cacheManager.video,
            extension: urlConfig.type,
            responseType: 'arraybuffer',
            key: key,
            url: urlConfig.url,
            xhrSettings: xhrSettings,
            config: {
                loadEvent: loadEvent,
                asBlob: asBlob
            }
        };

        File.call(this, loader, fileConfig);

        //  New properties specific to this class
        // this.locked = 'ontouchstart' in window;
        // this.loaded = false;
        // this.filesLoaded = 0;
        // this.filesTotal = 0;
    },

    /**
     * Called automatically by Loader.nextFile.
     * This method controls what extra work this File does with its loaded data.
     *
     * @method Phaser.Loader.FileTypes.BinaryFile#onProcess
     * @since 3.7.0
     */
    onProcess: function ()
    {
        this.state = CONST.FILE_PROCESSING;

        // var ctor = this.config.dataType;

        // this.data = (ctor) ? new ctor(this.xhrLoader.response) : this.xhrLoader.response;

        this.data = this.xhrLoader.response;

        this.onProcessComplete();
    }

    /**
     * Called when the file finishes loading.
     *
     * @method Phaser.Loader.FileTypes.HTML5AudioFile#onLoad
     * @since 3.0.0
    onLoad: function ()
    {
        if (this.loaded)
        {
            return;
        }

        this.loaded = true;

        this.loader.nextFile(this, true);
    },
     */

    /**
     * Called if the file errors while loading.
     *
     * @method Phaser.Loader.FileTypes.HTML5AudioFile#onError
     * @since 3.0.0
    onError: function ()
    {
        for (var i = 0; i < this.data.length; i++)
        {
            var audio = this.data[i];

            audio.oncanplaythrough = null;
            audio.onerror = null;
        }

        this.loader.nextFile(this, false);
    },
     */

    /**
     * Called during the file load progress. Is sent a DOM ProgressEvent.
     *
     * @method Phaser.Loader.FileTypes.HTML5AudioFile#onProgress
     * @fires Phaser.Loader.Events#FILE_PROGRESS
     * @since 3.0.0
    onProgress: function (event)
    {
        var audio = event.target;

        audio.oncanplaythrough = null;
        audio.onerror = null;

        this.filesLoaded++;

        this.percentComplete = Math.min((this.filesLoaded / this.filesTotal), 1);

        this.loader.emit(Events.FILE_PROGRESS, this, this.percentComplete);

        if (this.filesLoaded === this.filesTotal)
        {
            this.onLoad();
        }
    },
     */

    /**
     * Called by the Loader, starts the actual file downloading.
     * During the load the methods onLoad, onError and onProgress are called, based on the XHR events.
     * You shouldn't normally call this method directly, it's meant to be invoked by the Loader.
     *
     * @method Phaser.Loader.FileTypes.HTML5AudioFile#load
     * @since 3.0.0
    load: function ()
    {
        this.data = [];

        var instances = (this.config && this.config.instances) || 1;

        this.filesTotal = instances;
        this.filesLoaded = 0;
        this.percentComplete = 0;

        for (var i = 0; i < instances; i++)
        {
            var audio = new Audio();
            audio.dataset = {};
            audio.dataset.name = this.key + ('0' + i).slice(-2);
            audio.dataset.used = 'false';

            if (this.locked)
            {
                audio.dataset.locked = 'true';
            }
            else
            {
                audio.dataset.locked = 'false';

                audio.preload = 'auto';
                audio.oncanplaythrough = this.onProgress.bind(this);
                audio.onerror = this.onError.bind(this);
            }

            this.data.push(audio);
        }

        for (i = 0; i < this.data.length; i++)
        {
            audio = this.data[i];
            audio.src = GetURL(this, this.loader.baseURL);

            if (!this.locked)
            {
                audio.load();
            }
        }

        if (this.locked)
        {
            //  This is super-dangerous but works. Race condition potential high.
            //  Is there another way?
            setTimeout(this.onLoad.bind(this));
        }
    }
     */

});

VideoFile.create = function (loader, key, urls, loadEvent, asBlob, xhrSettings)
{
    var game = loader.systems.game;

    //  url may be inside key, which may be an object
    if (IsPlainObject(key))
    {
        urls = GetFastValue(key, 'url', []);
        loadEvent = GetFastValue(key, 'loadEvent', 'canplaythrough');
        asBlob = GetFastValue(key, 'asBlob', false);
        xhrSettings = GetFastValue(key, 'xhrSettings');
    }

    var urlConfig = VideoFile.getVideoURL(game, urls);

    if (urlConfig)
    {
        return new VideoFile(loader, key, urlConfig, loadEvent, asBlob, xhrSettings);
    }
};

VideoFile.getVideoURL = function (game, urls)
{
    if (!Array.isArray(urls))
    {
        urls = [ urls ];
    }

    for (var i = 0; i < urls.length; i++)
    {
        var url = GetFastValue(urls[i], 'url', urls[i]);

        if (url.indexOf('blob:') === 0 || url.indexOf('data:') === 0)
        {
            return url;
        }

        var videoType = url.match(/\.([a-zA-Z0-9]+)($|\?)/);

        videoType = GetFastValue(urls[i], 'type', (videoType) ? videoType[1] : '').toLowerCase();

        if (game.device.video[videoType])
        {
            return {
                url: url,
                type: videoType
            };
        }
    }

    return null;
};

/**
 * Adds an Audio or HTML5Audio file, or array of audio files, to the current load queue.
 *
 * You can call this method from within your Scene's `preload`, along with any other files you wish to load:
 * 
 * ```javascript
 * function preload ()
 * {
 *     this.load.audio('title', [ 'music/Title.ogg', 'music/Title.mp3', 'music/Title.m4a' ]);
 * }
 * ```
 *
 * The file is **not** loaded right away. It is added to a queue ready to be loaded either when the loader starts,
 * or if it's already running, when the next free load slot becomes available. This happens automatically if you
 * are calling this from within the Scene's `preload` method, or a related callback. Because the file is queued
 * it means you cannot use the file immediately after calling this method, but must wait for the file to complete.
 * The typical flow for a Phaser Scene is that you load assets in the Scene's `preload` method and then when the
 * Scene's `create` method is called you are guaranteed that all of those assets are ready for use and have been
 * loaded.
 * 
 * The key must be a unique String. It is used to add the file to the global Audio Cache upon a successful load.
 * The key should be unique both in terms of files being loaded and files already present in the Audio Cache.
 * Loading a file using a key that is already taken will result in a warning. If you wish to replace an existing file
 * then remove it from the Audio Cache first, before loading a new one.
 *
 * Instead of passing arguments you can pass a configuration object, such as:
 * 
 * ```javascript
 * this.load.audio({
 *     key: 'title',
 *     url: [ 'music/Title.ogg', 'music/Title.mp3', 'music/Title.m4a' ]
 * });
 * ```
 *
 * See the documentation for `Phaser.Types.Loader.FileTypes.VideoFileConfig` for more details.
 *
 * The URLs can be relative or absolute. If the URLs are relative the `Loader.baseURL` and `Loader.path` values will be prepended to them.
 *
 * Due to different browsers supporting different audio file types you should usually provide your audio files in a variety of formats.
 * ogg, mp3 and m4a are the most common. If you provide an array of URLs then the Loader will determine which _one_ file to load based on
 * browser support.
 *
 * If audio has been disabled in your game, either via the game config, or lack of support from the device, then no audio will be loaded.
 *
 * Note: The ability to load this type of file will only be available if the Audio File type has been built into Phaser.
 * It is available in the default build but can be excluded from custom builds.
 *
 * @method Phaser.Loader.LoaderPlugin#video
 * @fires Phaser.Loader.LoaderPlugin#addFileEvent
 * @since 3.20.0
 *
 * @param {(string|Phaser.Types.Loader.FileTypes.VideoFileConfig|Phaser.Types.Loader.FileTypes.VideoFileConfig[])} key - The key to use for this file, or a file configuration object, or array of them.
 * @param {(string|string[])} [urls] - The absolute or relative URL to load the audio files from.
 * @param {any} [config] - An object containing an `instances` property for HTML5Audio. Defaults to 1.
 * @param {Phaser.Types.Loader.XHRSettingsObject} [xhrSettings] - An XHR Settings configuration object. Used in replacement of the Loaders default XHR Settings.
 *
 * @return {Phaser.Loader.LoaderPlugin} The Loader instance.
 */
FileTypesManager.register('video', function (key, urls, loadEvent, asBlob, xhrSettings)
{
    var videoFile;

    if (Array.isArray(key))
    {
        for (var i = 0; i < key.length; i++)
        {
            //  If it's an array it has to be an array of Objects, so we get everything out of the 'key' object
            videoFile = VideoFile.create(this, key[i]);

            if (videoFile)
            {
                this.addFile(videoFile);
            }
        }
    }
    else
    {
        videoFile = VideoFile.create(this, key, urls, loadEvent, asBlob, xhrSettings);

        if (videoFile)
        {
            this.addFile(videoFile);
        }
    }

    return this;
});

module.exports = VideoFile;
