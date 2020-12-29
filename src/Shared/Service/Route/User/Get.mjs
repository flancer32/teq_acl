/**
 * Request and response for '/user/get' service (get user ACL).
 */
class Fl32_Teq_Acl_Shared_Service_Route_User_Get_Request {
}

class Fl32_Teq_Acl_Shared_Service_Route_User_Get_Response {
    /**
     * User permissions as {id=>code} structure.
     * @type {Object.<Number, String>}
     */
    permissions
    /**
     * User data.
     * @type {Fl32_Teq_User_Shared_Service_Data_User}
     */
    user
}

export {
    Fl32_Teq_Acl_Shared_Service_Route_User_Get_Request as Request,
    Fl32_Teq_Acl_Shared_Service_Route_User_Get_Response as Response,
};
