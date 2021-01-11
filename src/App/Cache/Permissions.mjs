/**
 * Cache for user permission data with userId as a keys.
 * This class is wrapper for the Map with JSDoc hints.
 * We can use simple Map instance as named singleton in this case (w/o JSDoc hints, of cause).
 */
export default class Fl32_Teq_Acl_App_Cache_Permissions {

    constructor() {
        let map = new Map();

        this.clear = function () {
            map.clear();
        };
        this.delete = function (userId) {
            map.delete(userId);
        };
        /**
         * @param {String} userId
         * @return {Object<Number, String>|null}
         */
        this.get = function (userId) {
            return map.get(userId) ?? null;
        };
        /**
         * @param {String} userId
         * @param {Object<Number, String>} user
         */
        this.set = function (userId, user) {
            map.set(userId, user);
        };
    }
}
