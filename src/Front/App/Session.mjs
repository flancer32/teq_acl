/**
 * Session object for frontend realms. Contains data for authenticated user including permissions data.
 * @extends Fl32_Teq_User_Front_App_Session
 */
export default class Fl32_Teq_Acl_Front_App_Session {

    constructor(spec) {
        /** @type {TeqFw_Core_App_Obj_Factory} */
        const objFactory = spec['TeqFw_Core_App_Obj_Factory$']; // singleton instance
        /** @type {Fl32_Teq_User_Defaults} */
        const DEF_USER = spec['Fl32_Teq_User_Defaults$'];   // singleton instance
        /** @type {Fl32_Teq_User_Front_App_Session} */
        const base = spec['Fl32_Teq_User_Front_App_Session$$'];    // new instance

        // POPULATE CURRENT INSTANCE WITH BASE CLASSES METHODS (COMPOSITION INSTEAD OF INHERITANCE)
        objFactory.assignObjectMethods(this, base);

        /**
         * Return 'true' if user in session has given permission.
         * @param {String} perm
         * @return {Boolean}
         */
        this.hasPermission = function (perm) {
            /** @type {Fl32_Teq_Acl_Shared_Service_Data_UserAcl} */
            const user = this.getUser();
            return user && user.permissions && Object.values(user.permissions).includes(perm);
        };

        /**
         * Redirect to sign in route if user in session has no given permission.
         * @param {Object} router Vue Router
         * @param {String} perm
         * @return {Promise<Boolean>} 'true' if user has requested permission
         */
        this.isAccessGranted = async function (router, perm) {
            if (!this.hasPermission(perm)) {
                const routeCurrent = router.currentRoute.value.path;
                this.setRouteToRedirect(routeCurrent);
                const routeSignIn = this.getRouteToSignIn() ?? DEF_USER.ROUTE_SIGN_IN;
                await router.push(routeSignIn);
                return false;
            } else {
                return true;
            }
        };
    }

}
