import debounce from 'debounce';
import arrayEqual from 'array-equal';
import findAllLevels from './levels';
import LevelControl from './level_control';
import { layers } from './layers';
import loadSprite from './sprite';

/**
 * Load the indoor= source and layers in your map.
 * @param {object} map the mapbox-gl instance of the map
 * @param {object} options
 * @param {source} [options.source] Override the default tiles URL (https://tiles.openindoor.org/).
 * @param {string} [options.apiKey] The API key if you use the default tile URL (get your free key at [openindoor.com](https://openindoor.com)).
 * @param {array} [options.layers] The layers to be used to style indoor= tiles.
 * @property {string} level The current level displayed
 * @property {array} levels  The levels that can be displayed in the current view
 * @fires OpenIndoor#levelschange
 * @fires OpenIndoor#levelchange
 * @return {OpenIndoor} `this`
 */
export default class OpenIndoor {
  constructor(map, options = {}) {
    const defaultOpts = {
      sourceId: "indoor",
      // source: {
      //   type: 'vector',
      //   url: 'https://api.openindoor.io/tileserver/data/france.json'
      // },
      layerId: "osm-indoor",
      layers
    };

    const opts = { ...defaultOpts, ...options };
    this.map = map;
    this.sourceId = opts.sourceId;
    this.layerId = opts.layerId;
    // this.source = opts.source;
    this.apiKey = opts.apiKey;
    this.layers = opts.layers;
    this.levels = [];
    this.level = ("level" in opts) ? opts.level : "0";
    console.log("opts:", opts);
    console.log("this.level 01:", this.level);
    this.events = {};

    if (this.map.isStyleLoaded()) {
      this._addSource();
    } else {
      this.map.on('load', this._addSource.bind(this));
    }
  }

  /**
   * Add an event listener
   * @param {string} name the name of the event
   * @param {function} fn the function to be called when the event is emitted
   */
  on(name, fn) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    this.events[name].push(fn);
  }

  /**
   * Remove an event listener.
   * @param {string} name the name of the event
   * @param {function} fn the same function when on() was called
   */
  off(name, fn) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    this.events[name] = this.events[name].filter(cb => cb !== fn);
  }

  /**
   * Add the level control to the map
   * Used when adding the control via the map instance: map.addControl(openIndoor)
   */
  onAdd() {
    this._control = new LevelControl(this);
    return this._control.$el;
  }

  /**
   * Remove the level control
   * Used when removing the control via the map instance: map.removeControl(openIndoor)
   */
  onRemove() {
    this._control.destroy();
    this._control = null;
  }

  /**
   * Set the displayed level.
   * @param {string} level the level to be displayed
   * @fires OpenIndoor#levelchange
   */
  setLevel(level) {
    this.level = level;
    this._updateFilters();
    this._emitLevelChange();
  }

  /**
   * Set the displayed level.
   * @deprecated Use setLevel instead
   * @param {string} level the level to be displayed
   * @fires OpenIndoor#levelchange
   */
  updateLevel(level) {
    console.log('The updateLevel method is deprecated. Please use setLevel instead.');
    this.setLevel(level);
  }

  /**
   * Load a sprite and add all images to the map
   * @param {string} baseUrl the baseUrl where to load the sprite
   * @param {object} options
   * @param {url} [options.update] Update existing image (default false)
   * @return {Promise} It resolves an hash of images.
   */
  loadSprite(baseUrl, options = {}) {
    const opts = { update: false, ...options };
    return loadSprite(baseUrl)
      .then((sprite) => {
        for (const id in sprite) {
          const { data, ...options } = sprite[id];
          if (!this.map.hasImage(id)) {
            this.map.addImage(id, data, options);
          } else if (opts.update) {
            this.map.updateImage(id, data);
          }
        }
        return sprite;
      });
  }

  _addSource() {
    // const queryParams = this.apiKey ? `?key=${this.apiKey}` : '';
    // this.map.addSource(this.sourceId, {
    //   type: 'vector',
    //   url: `${this.url}${queryParams}`
    // });
    // this.map.addSource(this.sourceId, this.source);
    // this.layers.forEach((layer) => {
    //   this.map.addLayer({
    //     source: this.sourceId,
    //     ...layer
    //   })
    // });
    this._updateFilters();
    const updateLevels = debounce(this._updateLevels.bind(this), 1000);

    this.map.on('load', updateLevels);
    this.map.on('data', updateLevels);
    this.map.on('move', updateLevels);
  }

  _updateFilters() {
    this.layers.forEach((layer) => {
      // console.log("this.level 02:", this.level);
      let levelFilter = [
        "all",
        [
          "has",
          "level"
        ],
        [
          "any",
          [
            "==",
            ["get", "level"],
            this.level
          ],
          [
            "all",
            [
              "!=",
              [
                "index-of",
                ";",
                ["get", "level"]
              ],
              -1,
            ],
            [

              ">=",
              ["to-number", this.level],
              [
                "to-number",
                [
                  "slice",
                  ["get", "level"],
                  0,
                  [
                    "index-of",
                    ";",
                    ["get", "level"]
                  ]
                ]
              ]
            ],
            [
              "<=",
              ["to-number", this.level],
              [
                "to-number",
                [
                  "slice",
                  ["get", "level"],
                  [
                    "+",
                    [
                      "index-of",
                      ";",
                      ["get", "level"]
                    ],
                    1
                  ]
                ]
              ]
            ]
          ]
        ]
      ];
      // console.log("layer.filter:", layer.filter);
      let combinedFilter = ["all", layer.filter, levelFilter];
      this.map.setFilter(
        layer.id,
        // [ ...layer.filter || ['all'], ['==', 'level', this.level]]
        combinedFilter
      );
    });
  }

  _refreshAfterLevelsUpdate() {
    if (
      (this.levels != undefined)
      && (!this.levels.includes(this.level))
    ) {
      console.log('this.levels:' + this.levels)
      console.log("this.level set to 0:", this.level);
      this.setLevel('0');
    }
  }

  _updateLevels() {
    if (this.map.isSourceLoaded(this.sourceId)) {
      const features = this.map.querySourceFeatures(this.sourceId, { sourceLayer: this.layerId });
      console.log('features to detect levels:', features)
      // for (let feat in features) {
      //   if (('properties' in feat) && ('level' in feat['properties'])) {
      //     console.log('level: ' + feat['properties']['level'])
      //   }
      // }
      // console.log('features from ' + this.sourceId + ' to update levels: ' + JSON.stringify(features))
      const levels = findAllLevels(features);
      if (!arrayEqual(levels, this.levels)) {
        this.levels = levels;
        this._emitLevelsChange();
        this._refreshAfterLevelsUpdate();
      }
    }
  }

  _emitLevelsChange() {
    this._emitEvent('levelschange', this.levels);
  }

  _emitLevelChange() {
    this._emitEvent('levelchange', this.level);
  }

  _emitEvent(eventName, ...args) {
    (this.events[eventName] || []).forEach(fn => fn(...args));
  }
}

/**
 * Emitted when the list of available levels has been updated
 *
 * @event OpenIndoor#levelschange
 * @type {array}
 */

/**
 * Emitted when the list of available levels has been updated
 *
 * @event OpenIndoor#levelchange
 * @type {string} always emitted when the level displayed has changed
 */
