__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "PermissionStatus", {
    enumerable: true,
    get: function () {
      return _expoModulesCore.PermissionStatus;
    }
  });
  Object.defineProperty(exports, "EventEmitter", {
    enumerable: true,
    get: function () {
      return _LocationEventEmitter.LocationEventEmitter;
    }
  });
  Object.defineProperty(exports, "_getCurrentWatchId", {
    enumerable: true,
    get: function () {
      return _LocationSubscribers._getCurrentWatchId;
    }
  });
  Object.defineProperty(exports, "installWebGeolocationPolyfill", {
    enumerable: true,
    get: function () {
      return _GeolocationPolyfill.installWebGeolocationPolyfill;
    }
  });
  Object.defineProperty(exports, "Accuracy", {
    enumerable: true,
    get: function () {
      return _LocationTypes.LocationAccuracy;
    }
  });
  Object.defineProperty(exports, "ActivityType", {
    enumerable: true,
    get: function () {
      return _LocationTypes.LocationActivityType;
    }
  });
  Object.defineProperty(exports, "GeofencingEventType", {
    enumerable: true,
    get: function () {
      return _LocationTypes.LocationGeofencingEventType;
    }
  });
  Object.defineProperty(exports, "GeofencingRegionState", {
    enumerable: true,
    get: function () {
      return _LocationTypes.LocationGeofencingRegionState;
    }
  });
  var _expoModulesCore = require(_dependencyMap[0]);
  var _LocationEventEmitter = require(_dependencyMap[1]);
  var _LocationSubscribers = require(_dependencyMap[2]);
  var _GeolocationPolyfill = require(_dependencyMap[3]);
  var _Location = require(_dependencyMap[4]);
  Object.keys(_Location).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _Location[k];
        }
      });
    }
  });
  var _LocationTypes = require(_dependencyMap[5]);
  Object.keys(_LocationTypes).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _LocationTypes[k];
        }
      });
    }
  });
},2998,[531,2999,3000,3003,3004,3002]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "LocationEventEmitter", {
    enumerable: true,
    get: function () {
      return LocationEventEmitter;
    }
  });
  var _expoModulesCore = require(_dependencyMap[0]);
  const LocationEventEmitter = new _expoModulesCore.EventEmitter();
},2999,[531]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "LocationSubscriber", {
    enumerable: true,
    get: function () {
      return LocationSubscriber;
    }
  });
  Object.defineProperty(exports, "HeadingSubscriber", {
    enumerable: true,
    get: function () {
      return HeadingSubscriber;
    }
  });
  Object.defineProperty(exports, "LocationErrorSubscriber", {
    enumerable: true,
    get: function () {
      return LocationErrorSubscriber;
    }
  });
  exports._getCurrentWatchId = _getCurrentWatchId;
  var _ExpoLocation = require(_dependencyMap[0]);
  var ExpoLocation = _interopDefault(_ExpoLocation);
  var _LocationEventEmitter = require(_dependencyMap[1]);
  let nextWatchId = 0;
  class Subscriber {
    callbacks = {};
    eventSubscription = null;
    constructor(eventName, eventDataField) {
      this.eventName = eventName;
      this.eventDataField = eventDataField;
    }
    maybeInitializeSubscription() {
      if (this.eventSubscription) {
        return;
      }
      this.eventSubscription = _LocationEventEmitter.LocationEventEmitter.addListener(this.eventName, event => this.trigger(event));
    }
    /**
     * Registers given callback under new id which is then returned.
     */
    registerCallback(callback) {
      this.maybeInitializeSubscription();
      const id = ++nextWatchId;
      this.callbacks[id] = callback;
      return id;
    }
    /**
     * Registers given callback under and existing id. This can be used to
     * create a subscriber for the error event on the same id as the location
     * event is subscribed to.
     */
    registerCallbackForId(watchId, callback) {
      this.maybeInitializeSubscription();
      const id = watchId;
      this.callbacks[id] = callback;
      return id;
    }
    /**
     * Unregisters a callback with given id and revokes the subscription if possible.
     */
    unregisterCallback(id) {
      // Do nothing if we have already unregistered the callback.
      if (!this.callbacks[id]) {
        return;
      }
      delete this.callbacks[id];
      ExpoLocation.default.removeWatchAsync(id);
      if (Object.keys(this.callbacks).length === 0 && this.eventSubscription) {
        _LocationEventEmitter.LocationEventEmitter.removeSubscription(this.eventSubscription);
        this.eventSubscription = null;
      }
    }
    trigger(event) {
      const watchId = event.watchId;
      const callback = this.callbacks[watchId];
      if (callback) {
        callback(event[this.eventDataField]);
      } else {
        ExpoLocation.default.removeWatchAsync(watchId);
      }
    }
  }
  const LocationSubscriber = new Subscriber('Expo.locationChanged', 'location');
  const HeadingSubscriber = new Subscriber('Expo.headingChanged', 'heading');
  const LocationErrorSubscriber = new Subscriber('Expo.locationError', 'reason');
  /**
   * @private Necessary for some unit tests.
   */
  function _getCurrentWatchId() {
    return nextWatchId;
  }
},3000,[3001,2999]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _expoModulesCore = require(_dependencyMap[0]);
  var _LocationTypes = require(_dependencyMap[1]);
  var _LocationEventEmitter = require(_dependencyMap[2]);
  class GeocoderError extends Error {
    constructor() {
      super('Geocoder service is not available for this device.');
      this.code = 'E_NO_GEOCODER';
    }
  }
  /**
   * Converts `GeolocationPosition` to JavaScript object.
   */
  function geolocationPositionToJSON(position) {
    const {
      coords,
      timestamp
    } = position;
    return {
      coords: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: coords.altitude,
        accuracy: coords.accuracy,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        speed: coords.speed
      },
      timestamp
    };
  }
  /**
   * Checks whether given location didn't exceed given `maxAge` and fits in the required accuracy.
   */
  function isLocationValid(location, options) {
    const maxAge = typeof options.maxAge === 'number' ? options.maxAge : Infinity;
    const requiredAccuracy = typeof options.requiredAccuracy === 'number' ? options.requiredAccuracy : Infinity;
    const locationAccuracy = location.coords.accuracy ?? Infinity;
    return Date.now() - location.timestamp <= maxAge && locationAccuracy <= requiredAccuracy;
  }
  /**
   * Gets the permission details. The implementation is not very good as it's not
   * possible to query for permission on all browsers, apparently only the
   * latest versions will support this.
   */
  async function getPermissionsAsync(shouldAsk = false) {
    if (!navigator?.permissions?.query) {
      throw new _expoModulesCore.UnavailabilityError('expo-location', 'navigator.permissions API is not available');
    }
    const permission = await navigator.permissions.query({
      name: 'geolocation'
    });
    if (permission.state === 'granted') {
      return {
        status: _expoModulesCore.PermissionStatus.GRANTED,
        granted: true,
        canAskAgain: true,
        expires: 0
      };
    }
    if (permission.state === 'denied') {
      return {
        status: _expoModulesCore.PermissionStatus.DENIED,
        granted: false,
        canAskAgain: true,
        expires: 0
      };
    }
    if (shouldAsk) {
      return new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(() => {
          resolve({
            status: _expoModulesCore.PermissionStatus.GRANTED,
            granted: true,
            canAskAgain: true,
            expires: 0
          });
        }, positionError => {
          if (positionError.code === positionError.PERMISSION_DENIED) {
            resolve({
              status: _expoModulesCore.PermissionStatus.DENIED,
              granted: false,
              canAskAgain: true,
              expires: 0
            });
            return;
          }
          resolve({
            status: _expoModulesCore.PermissionStatus.GRANTED,
            granted: false,
            canAskAgain: true,
            expires: 0
          });
        });
      });
    }
    // The permission state is 'prompt' when the permission has not been requested
    // yet, tested on Chrome.
    return {
      status: _expoModulesCore.PermissionStatus.UNDETERMINED,
      granted: false,
      canAskAgain: true,
      expires: 0
    };
  }
  let lastKnownPosition = null;
  var _default = {
    async getProviderStatusAsync() {
      return {
        locationServicesEnabled: 'geolocation' in navigator
      };
    },
    async getLastKnownPositionAsync(options = {}) {
      if (lastKnownPosition && isLocationValid(lastKnownPosition, options)) {
        return lastKnownPosition;
      }
      return null;
    },
    async getCurrentPositionAsync(options) {
      return new Promise((resolve, reject) => {
        const resolver = position => {
          lastKnownPosition = geolocationPositionToJSON(position);
          resolve(lastKnownPosition);
        };
        navigator.geolocation.getCurrentPosition(resolver, reject, Object.assign({
          maximumAge: Infinity,
          enableHighAccuracy: (options.accuracy ?? 0) > _LocationTypes.LocationAccuracy.Balanced
        }, options));
      });
    },
    async removeWatchAsync(watchId) {
      navigator.geolocation.clearWatch(watchId);
    },
    async watchDeviceHeading(_headingId) {
      console.warn('Location.watchDeviceHeading: is not supported on web');
    },
    async hasServicesEnabledAsync() {
      return 'geolocation' in navigator;
    },
    async geocodeAsync() {
      throw new GeocoderError();
    },
    async reverseGeocodeAsync() {
      throw new GeocoderError();
    },
    async watchPositionImplAsync(watchId, options) {
      return new Promise(resolve => {
        watchId = navigator.geolocation.watchPosition(position => {
          lastKnownPosition = geolocationPositionToJSON(position);
          _LocationEventEmitter.LocationEventEmitter.emit('Expo.locationChanged', {
            watchId,
            location: lastKnownPosition
          });
        }, undefined, options);
        resolve(watchId);
      });
    },
    async requestForegroundPermissionsAsync() {
      return getPermissionsAsync(true);
    },
    async requestBackgroundPermissionsAsync() {
      return getPermissionsAsync(true);
    },
    async getForegroundPermissionsAsync() {
      return getPermissionsAsync();
    },
    async getBackgroundPermissionsAsync() {
      return getPermissionsAsync();
    }
  };
},3001,[531,3002,2999]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "LocationAccuracy", {
    enumerable: true,
    get: function () {
      return LocationAccuracy;
    }
  });
  Object.defineProperty(exports, "LocationActivityType", {
    enumerable: true,
    get: function () {
      return LocationActivityType;
    }
  });
  Object.defineProperty(exports, "LocationGeofencingEventType", {
    enumerable: true,
    get: function () {
      return LocationGeofencingEventType;
    }
  });
  Object.defineProperty(exports, "LocationGeofencingRegionState", {
    enumerable: true,
    get: function () {
      return LocationGeofencingRegionState;
    }
  });
  // @needsAudit
  /**
   * Enum with available location accuracies.
   */
  var LocationAccuracy;
  (function (LocationAccuracy) {
    /**
     * Accurate to the nearest three kilometers.
     */
    LocationAccuracy[LocationAccuracy["Lowest"] = 1] = "Lowest";
    /**
     * Accurate to the nearest kilometer.
     */
    LocationAccuracy[LocationAccuracy["Low"] = 2] = "Low";
    /**
     * Accurate to within one hundred meters.
     */
    LocationAccuracy[LocationAccuracy["Balanced"] = 3] = "Balanced";
    /**
     * Accurate to within ten meters of the desired target.
     */
    LocationAccuracy[LocationAccuracy["High"] = 4] = "High";
    /**
     * The best level of accuracy available.
     */
    LocationAccuracy[LocationAccuracy["Highest"] = 5] = "Highest";
    /**
     * The highest possible accuracy that uses additional sensor data to facilitate navigation apps.
     */
    LocationAccuracy[LocationAccuracy["BestForNavigation"] = 6] = "BestForNavigation";
  })(LocationAccuracy || (LocationAccuracy = {}));
  // @needsAudit
  /**
   * Enum with available activity types of background location tracking.
   */
  var LocationActivityType;
  (function (LocationActivityType) {
    /**
     * Default activity type. Use it if there is no other type that matches the activity you track.
     */
    LocationActivityType[LocationActivityType["Other"] = 1] = "Other";
    /**
     * Location updates are being used specifically during vehicular navigation to track location
     * changes to the automobile.
     */
    LocationActivityType[LocationActivityType["AutomotiveNavigation"] = 2] = "AutomotiveNavigation";
    /**
     * Use this activity type if you track fitness activities such as walking, running, cycling,
     * and so on.
     */
    LocationActivityType[LocationActivityType["Fitness"] = 3] = "Fitness";
    /**
     * Activity type for movements for other types of vehicular navigation that are not automobile
     * related.
     */
    LocationActivityType[LocationActivityType["OtherNavigation"] = 4] = "OtherNavigation";
    /**
     * Intended for airborne activities. Fall backs to `ActivityType.Other` if
     * unsupported.
     * @platform ios
     */
    LocationActivityType[LocationActivityType["Airborne"] = 5] = "Airborne";
  })(LocationActivityType || (LocationActivityType = {}));
  // @needsAudit
  /**
   * A type of the event that geofencing task can receive.
   */
  var LocationGeofencingEventType;
  (function (LocationGeofencingEventType) {
    /**
     * Emitted when the device entered observed region.
     */
    LocationGeofencingEventType[LocationGeofencingEventType["Enter"] = 1] = "Enter";
    /**
     * Occurs as soon as the device left observed region
     */
    LocationGeofencingEventType[LocationGeofencingEventType["Exit"] = 2] = "Exit";
  })(LocationGeofencingEventType || (LocationGeofencingEventType = {}));
  // @needsAudit
  /**
   * State of the geofencing region that you receive through the geofencing task.
   */
  var LocationGeofencingRegionState;
  (function (LocationGeofencingRegionState) {
    /**
     * Indicates that the device position related to the region is unknown.
     */
    LocationGeofencingRegionState[LocationGeofencingRegionState["Unknown"] = 0] = "Unknown";
    /**
     * Indicates that the device is inside the region.
     */
    LocationGeofencingRegionState[LocationGeofencingRegionState["Inside"] = 1] = "Inside";
    /**
     * Inverse of inside state.
     */
    LocationGeofencingRegionState[LocationGeofencingRegionState["Outside"] = 2] = "Outside";
  })(LocationGeofencingRegionState || (LocationGeofencingRegionState = {}));
},3002,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  exports.installWebGeolocationPolyfill = installWebGeolocationPolyfill;
  require(_dependencyMap[0]);
  var _ExpoLocation = require(_dependencyMap[1]);
  var ExpoLocation = _interopDefault(_ExpoLocation);
  var _LocationTypes = require(_dependencyMap[2]);
  var _LocationSubscribers = require(_dependencyMap[3]);
  // @needsAudit
  /**
   * Polyfills `navigator.geolocation` for interop with the core React Native and Web API approach to geolocation.
   */
  function installWebGeolocationPolyfill() {}

  // This function exists to let us continue to return undefined from getCurrentPosition, while still
  // using async/await for the internal implementation of it

  // Polyfill: navigator.geolocation.watchPosition

  // Polyfill: navigator.geolocation.clearWatch
},3003,[531,3001,3002,3000]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  exports.getProviderStatusAsync = getProviderStatusAsync;
  exports.enableNetworkProviderAsync = enableNetworkProviderAsync;
  exports.getCurrentPositionAsync = getCurrentPositionAsync;
  exports.getLastKnownPositionAsync = getLastKnownPositionAsync;
  exports.watchPositionAsync = watchPositionAsync;
  exports.getHeadingAsync = getHeadingAsync;
  exports.watchHeadingAsync = watchHeadingAsync;
  exports.geocodeAsync = geocodeAsync;
  exports.reverseGeocodeAsync = reverseGeocodeAsync;
  exports.getForegroundPermissionsAsync = getForegroundPermissionsAsync;
  exports.requestForegroundPermissionsAsync = requestForegroundPermissionsAsync;
  Object.defineProperty(exports, "useForegroundPermissions", {
    enumerable: true,
    get: function () {
      return useForegroundPermissions;
    }
  });
  exports.getBackgroundPermissionsAsync = getBackgroundPermissionsAsync;
  exports.requestBackgroundPermissionsAsync = requestBackgroundPermissionsAsync;
  Object.defineProperty(exports, "useBackgroundPermissions", {
    enumerable: true,
    get: function () {
      return useBackgroundPermissions;
    }
  });
  exports.hasServicesEnabledAsync = hasServicesEnabledAsync;
  exports.isBackgroundLocationAvailableAsync = isBackgroundLocationAvailableAsync;
  exports.startLocationUpdatesAsync = startLocationUpdatesAsync;
  exports.stopLocationUpdatesAsync = stopLocationUpdatesAsync;
  exports.hasStartedLocationUpdatesAsync = hasStartedLocationUpdatesAsync;
  exports.startGeofencingAsync = startGeofencingAsync;
  exports.stopGeofencingAsync = stopGeofencingAsync;
  exports.hasStartedGeofencingAsync = hasStartedGeofencingAsync;
  var _expo = require(_dependencyMap[0]);
  var _expoModulesCore = require(_dependencyMap[1]);
  var _ExpoLocation = require(_dependencyMap[2]);
  var ExpoLocation = _interopDefault(_ExpoLocation);
  var _LocationTypes = require(_dependencyMap[3]);
  var _LocationSubscribers = require(_dependencyMap[4]);
  // Flag for warning about background services not being available in Expo Go
  let warnAboutExpoGoDisplayed = false;
  // @needsAudit
  /**
   * Check status of location providers.
   * @return A promise which fulfills with an object of type [`LocationProviderStatus`](#locationproviderstatus).
   */
  async function getProviderStatusAsync() {
    return ExpoLocation.default.getProviderStatusAsync();
  }
  // @needsAudit
  /**
   * Asks the user to turn on high accuracy location mode which enables network provider that uses
   * Google Play services to improve location accuracy and location-based services.
   * @return A promise resolving as soon as the user accepts the dialog. Rejects if denied.
   *
   * @platform android
   */
  async function enableNetworkProviderAsync() {}
  // @needsAudit
  /**
   * Requests for one-time delivery of the user's current location.
   * Depending on given `accuracy` option it may take some time to resolve,
   * especially when you're inside a building.
   * > __Note:__ Calling it causes the location manager to obtain a location fix which may take several
   * > seconds. Consider using [`getLastKnownPositionAsync`](#locationgetlastknownpositionasyncoptions)
   * > if you expect to get a quick response and high accuracy is not required.
   * @param options
   * @return A promise which fulfills with an object of type [`LocationObject`](#locationobject).
   */
  async function getCurrentPositionAsync(options = {}) {
    return ExpoLocation.default.getCurrentPositionAsync(options);
  }
  // @needsAudit
  /**
   * Gets the last known position of the device or `null` if it's not available or doesn't match given
   * requirements such as maximum age or required accuracy.
   * It's considered to be faster than `getCurrentPositionAsync` as it doesn't request for the current
   * location, but keep in mind the returned location may not be up-to-date.
   * @param options
   * @return A promise which fulfills with an object of type [`LocationObject`](#locationobject) or
   * `null` if it's not available or doesn't match given requirements such as maximum age or required
   * accuracy.
   */
  async function getLastKnownPositionAsync(options = {}) {
    return ExpoLocation.default.getLastKnownPositionAsync(options);
  }
  // @needsAudit
  /**
   * Subscribe to location updates from the device. Updates will only occur while the application is in
   * the foreground. To get location updates while in background you'll need to use
   * [`startLocationUpdatesAsync`](#locationstartlocationupdatesasynctaskname-options).
   * @param options
   * @param callback This function is called on each location update. It receives an object of type
   * [`LocationObject`](#locationobject) as the first argument.
   * @param errorHandler This function is called when an error occurs. It receives a string with the
   * error message as the first argument.
   * @return A promise which fulfills with a [`LocationSubscription`](#locationsubscription) object.
   */
  async function watchPositionAsync(options, callback, errorHandler) {
    const watchId = _LocationSubscribers.LocationSubscriber.registerCallback(callback);
    errorHandler && _LocationSubscribers.LocationErrorSubscriber.registerCallbackForId(watchId, errorHandler);
    await ExpoLocation.default.watchPositionImplAsync(watchId, options);
    return {
      remove() {
        _LocationSubscribers.LocationSubscriber.unregisterCallback(watchId);
        errorHandler && _LocationSubscribers.LocationErrorSubscriber.unregisterCallback(watchId);
      }
    };
  }
  // @needsAudit
  /**
   * Gets the current heading information from the device. To simplify, it calls `watchHeadingAsync`
   * and waits for a couple of updates, and then returns the one that is accurate enough.
   * @return A promise which fulfills with an object of type [`LocationHeadingObject`](#locationheadingobject).
   */
  async function getHeadingAsync() {
    return new Promise(async (resolve, reject) => {
      let tries = 0;
      let subscriber = undefined;
      try {
        subscriber = await watchHeadingAsync(heading => {
          if (heading.accuracy > 1 || tries > 5) {
            subscriber?.remove();
            resolve(heading);
          } else {
            tries += 1;
          }
        }, reason => {
          subscriber?.remove();
          reject(reason);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  // @needsAudit
  /**
   * Subscribe to compass updates from the device.
   *
   * @param callback This function is called on each compass update. It receives an object of type
   * [LocationHeadingObject](#locationheadingobject) as the first argument.
   * @param errorHandler This function is called when an error occurs. It receives a string with the
   * error message as the first argument.
   * @return A promise which fulfills with a [`LocationSubscription`](#locationsubscription) object.
   *
   * @platform android
   * @platform ios
   */
  async function watchHeadingAsync(callback, errorHandler) {
    const watchId = _LocationSubscribers.HeadingSubscriber.registerCallback(callback);
    errorHandler && _LocationSubscribers.LocationErrorSubscriber.registerCallbackForId(watchId, errorHandler);
    await ExpoLocation.default.watchDeviceHeading(watchId);
    return {
      remove() {
        _LocationSubscribers.HeadingSubscriber.unregisterCallback(watchId);
        errorHandler && _LocationSubscribers.LocationErrorSubscriber.unregisterCallback(watchId);
      }
    };
  }
  // @needsAudit
  /**
   * Geocode an address string to latitude-longitude location.
   *
   * On Android, you must request location permissions with [`requestForegroundPermissionsAsync`](#locationrequestforegroundpermissionsasync)
   * before geocoding can be used.
   *
   * > **Note**: Geocoding is resource consuming and has to be used reasonably. Creating too many
   * > requests at a time can result in an error, so they have to be managed properly.
   * > It's also discouraged to use geocoding while the app is in the background and its results won't
   * > be shown to the user immediately.
   *
   * @param address A string representing address, eg. `"Baker Street London"`.
   * @return A promise which fulfills with an array (in most cases its size is 1) of [`LocationGeocodedLocation`](#locationgeocodedlocation)
   * objects.
   *
   * @platform android
   * @platform ios
   */
  async function geocodeAsync(address) {
    if (typeof address !== 'string') {
      throw new TypeError(`Address to geocode must be a string. Got ${address} instead.`);
    }
    {
      return [];
    }
    return await ExpoLocation.default.geocodeAsync(address);
  }
  // @needsAudit
  /**
   * Reverse geocode a location to postal address.
   *
   * On Android, you must request location permissions with [`requestForegroundPermissionsAsync`](#locationrequestforegroundpermissionsasync)
   * before geocoding can be used.
   *
   * > **Note**: Geocoding is resource consuming and has to be used reasonably. Creating too many
   * > requests at a time can result in an error, so they have to be managed properly.
   * > It's also discouraged to use geocoding while the app is in the background and its results won't
   * > be shown to the user immediately.
   *
   * @param location An object representing a location.
   * @return A promise which fulfills with an array (in most cases its size is 1) of [`LocationGeocodedAddress`](#locationgeocodedaddress) objects.
   *
   * @platform android
   * @platform ios
   */
  async function reverseGeocodeAsync(location) {
    if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      throw new TypeError('Location to reverse-geocode must be an object with number properties `latitude` and `longitude`.');
    }
    {
      return [];
    }
    return await ExpoLocation.default.reverseGeocodeAsync(location);
  }
  // @needsAudit
  /**
   * Checks user's permissions for accessing location while the app is in the foreground.
   * @return A promise that fulfills with an object of type [`LocationPermissionResponse`](#locationpermissionresponse).
   */
  async function getForegroundPermissionsAsync() {
    return await ExpoLocation.default.getForegroundPermissionsAsync();
  }
  // @needsAudit
  /**
   * Asks the user to grant permissions for location while the app is in the foreground.
   * @return A promise that fulfills with an object of type [`LocationPermissionResponse`](#locationpermissionresponse).
   */
  async function requestForegroundPermissionsAsync() {
    return await ExpoLocation.default.requestForegroundPermissionsAsync();
  }
  // @needsAudit
  /**
   * Check or request permissions for the foreground location.
   * This uses both `requestForegroundPermissionsAsync` and `getForegroundPermissionsAsync` to interact with the permissions.
   *
   * @example
   * ```ts
   * const [status, requestPermission] = Location.useForegroundPermissions();
   * ```
   */
  const useForegroundPermissions = (0, _expoModulesCore.createPermissionHook)({
    getMethod: getForegroundPermissionsAsync,
    requestMethod: requestForegroundPermissionsAsync
  });
  // @needsAudit
  /**
   * Checks user's permissions for accessing location while the app is in the background.
   * @return A promise that fulfills with an object of type [`PermissionResponse`](#permissionresponse).
   */
  async function getBackgroundPermissionsAsync() {
    return await ExpoLocation.default.getBackgroundPermissionsAsync();
  }
  // @needsAudit
  /**
   * Asks the user to grant permissions for location while the app is in the background.
   * On __Android 11 or higher__: this method will open the system settings page - before that happens
   * you should explain to the user why your application needs background location permission.
   * For example, you can use `Modal` component from `react-native` to do that.
   * > __Note__: Foreground permissions should be granted before asking for the background permissions
   * (your app can't obtain background permission without foreground permission).
   * @return A promise that fulfills with an object of type [`PermissionResponse`](#permissionresponse).
   */
  async function requestBackgroundPermissionsAsync() {
    return await ExpoLocation.default.requestBackgroundPermissionsAsync();
  }
  // @needsAudit
  /**
   * Check or request permissions for the background location.
   * This uses both `requestBackgroundPermissionsAsync` and `getBackgroundPermissionsAsync` to
   * interact with the permissions.
   *
   * @example
   * ```ts
   * const [status, requestPermission] = Location.useBackgroundPermissions();
   * ```
   */
  const useBackgroundPermissions = (0, _expoModulesCore.createPermissionHook)({
    getMethod: getBackgroundPermissionsAsync,
    requestMethod: requestBackgroundPermissionsAsync
  });
  // --- Location service
  // @needsAudit
  /**
   * Checks whether location services are enabled by the user.
   * @return A promise which fulfills to `true` if location services are enabled on the device,
   * or `false` if not.
   */
  async function hasServicesEnabledAsync() {
    return await ExpoLocation.default.hasServicesEnabledAsync();
  }
  // --- Background location updates
  function _validate(taskName) {
    if (!taskName || typeof taskName !== 'string') {
      throw new Error(`\`taskName\` must be a non-empty string. Got ${taskName} instead.`);
    }
    if ((0, _expo.isRunningInExpoGo)()) {
      if (!warnAboutExpoGoDisplayed) {
        const message = "Background location is limited in Expo Go:\nOn Android, it is not available at all.\nOn iOS, it works when running in the Simulator.\nYou can use this API, and all others, in a development build. Learn more: https://expo.fyi/dev-client.";
        console.warn(message);
        warnAboutExpoGoDisplayed = true;
      }
    }
  }
  // @docsMissing
  async function isBackgroundLocationAvailableAsync() {
    const providerStatus = await getProviderStatusAsync();
    return providerStatus.backgroundModeEnabled;
  }
  // @needsAudit
  /**
   * Registers for receiving location updates that can also come when the app is in the background.
   *
   * # Task parameters
   *
   * Background location task will be receiving following data:
   * - `locations` - An array of the new locations.
   *
   * @example
   * ```ts
   * import * as TaskManager from 'expo-task-manager';
   *
   * TaskManager.defineTask(YOUR_TASK_NAME, ({ data: { locations }, error }) => {
   *  if (error) {
   *    // check `error.message` for more details.
   *    return;
   *  }
   *  console.log('Received new locations', locations);
   * });
   * ```
   *
   * @param taskName Name of the task receiving location updates.
   * @param options An object of options passed to the location manager.
   *
   * @return A promise resolving once the task with location updates is registered.
   */
  async function startLocationUpdatesAsync(taskName, options = {
    accuracy: _LocationTypes.LocationAccuracy.Balanced
  }) {
    _validate(taskName);
    await ExpoLocation.default.startLocationUpdatesAsync(taskName, options);
  }
  // @needsAudit
  /**
   * Stops location updates for specified task.
   * @param taskName Name of the background location task to stop.
   * @return A promise resolving as soon as the task is unregistered.
   */
  async function stopLocationUpdatesAsync(taskName) {
    _validate(taskName);
    await ExpoLocation.default.stopLocationUpdatesAsync(taskName);
  }
  // @needsAudit
  /**
   * @param taskName Name of the location task to check.
   * @return A promise which fulfills with boolean value indicating whether the location task is
   * started or not.
   */
  async function hasStartedLocationUpdatesAsync(taskName) {
    _validate(taskName);
    return ExpoLocation.default.hasStartedLocationUpdatesAsync(taskName);
  }
  // --- Geofencing
  function _validateRegions(regions) {
    if (!regions || regions.length === 0) {
      throw new Error('Regions array cannot be empty. Use `stopGeofencingAsync` if you want to stop geofencing all regions');
    }
    for (const region of regions) {
      if (typeof region.latitude !== 'number') {
        throw new TypeError(`Region's latitude must be a number. Got '${region.latitude}' instead.`);
      }
      if (typeof region.longitude !== 'number') {
        throw new TypeError(`Region's longitude must be a number. Got '${region.longitude}' instead.`);
      }
      if (typeof region.radius !== 'number') {
        throw new TypeError(`Region's radius must be a number. Got '${region.radius}' instead.`);
      }
    }
  }
  // @needsAudit
  /**
   * Starts geofencing for given regions. When the new event comes, the task with specified name will
   * be called with the region that the device enter to or exit from.
   * If you want to add or remove regions from already running geofencing task, you can just call
   * `startGeofencingAsync` again with the new array of regions.
   *
   * # Task parameters
   *
   * Geofencing task will be receiving following data:
   *  - `eventType` - Indicates the reason for calling the task, which can be triggered by entering or exiting the region.
   *    See [`GeofencingEventType`](#geofencingeventtype).
   *  - `region` - Object containing details about updated region. See [`LocationRegion`](#locationregion) for more details.
   *
   * @param taskName Name of the task that will be called when the device enters or exits from specified regions.
   * @param regions Array of region objects to be geofenced.
   *
   * @return A promise resolving as soon as the task is registered.
   *
   * @example
   * ```ts
   * import { GeofencingEventType } from 'expo-location';
   * import * as TaskManager from 'expo-task-manager';
   *
   *  TaskManager.defineTask(YOUR_TASK_NAME, ({ data: { eventType, region }, error }) => {
   *   if (error) {
   *     // check `error.message` for more details.
   *     return;
   *   }
   *   if (eventType === GeofencingEventType.Enter) {
   *     console.log("You've entered region:", region);
   *   } else if (eventType === GeofencingEventType.Exit) {
   *     console.log("You've left region:", region);
   *   }
   * });
   * ```
   */
  async function startGeofencingAsync(taskName, regions = []) {
    _validate(taskName);
    _validateRegions(regions);
    await ExpoLocation.default.startGeofencingAsync(taskName, {
      regions
    });
  }
  // @needsAudit
  /**
   * Stops geofencing for specified task. It unregisters the background task so the app will not be
   * receiving any updates, especially in the background.
   * @param taskName Name of the task to unregister.
   * @return A promise resolving as soon as the task is unregistered.
   */
  async function stopGeofencingAsync(taskName) {
    _validate(taskName);
    await ExpoLocation.default.stopGeofencingAsync(taskName);
  }
  // @needsAudit
  /**
   * @param taskName Name of the geofencing task to check.
   * @return A promise which fulfills with boolean value indicating whether the geofencing task is
   * started or not.
   */
  async function hasStartedGeofencingAsync(taskName) {
    _validate(taskName);
    return ExpoLocation.default.hasStartedGeofencingAsync(taskName);
  }
},3004,[511,531,3001,3002,3000]);