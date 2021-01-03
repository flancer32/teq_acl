/**
 * Session object for frontend realms. Contains data for authenticated user including permissions data.
 * @extends Fl32_Teq_User_Front_App_Session
 */
export default class Fl32_Teq_Acl_Front_App_Session {

    constructor(spec) {
        /** @type {TeqFw_Core_App_Obj_Factory} */
        const objFactory = spec.TeqFw_Core_App_Obj_Factory$;
        /** @type {Fl32_Teq_User_Front_App_Session} */
        const base = spec.Fl32_Teq_User_Front_App_Session$$;    // new instance

        // POPULATE CURRENT INSTANCE WITH BASE CLASSES METHODS (COMPOSITION INSTEAD OF INHERITANCE)
        objFactory.assignObjectMethods(this, base);

        this.hasPermission = function (perm) {
            /** @type {Fl32_Teq_Acl_Shared_Service_Data_UserAcl} */
            const user = this.getUser();
            return user && user.permissions && Object.values(user.permissions).includes(perm);
        };
    }

}
