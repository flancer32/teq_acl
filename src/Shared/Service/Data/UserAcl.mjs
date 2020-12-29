/**
 * User ACL data in services API.
 */
export default class Fl32_Teq_Acl_Shared_Service_Data_UserAcl {
    // attributes names to use in queries to RDb (complex props cannot be used in RDB queries).
    // static A_PERMISSIONS = 'permissions';
    // static A_USER = 'user';

    /**
     * @type {Fl32_Teq_Acl_Shared_Service_Data_Permission[]}
     */
    permissions
    /**
     * User data.
     * @type {Fl32_Teq_User_Shared_Service_Data_User}
     */
    user
}
