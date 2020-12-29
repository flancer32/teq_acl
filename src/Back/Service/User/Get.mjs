/**
 * Service to get user permissions ("/api/${mod}/user/get").
 * User permissions are extracted from HTTP Request (see 'Fl32_Teq_Acl_App_Server_Permissions')
 */
export default class Fl32_Teq_Acl_Back_Service_User_Get {

    constructor(spec) {
        /** @type {typeof Fl32_Teq_Acl_Shared_Service_Data_UserAcl} */
        const UserAcl = spec['Fl32_Teq_Acl_Shared_Service_Data_UserAcl#'];
        /** @type {typeof Fl32_Teq_Acl_Shared_Service_Route_User_Get_Request} */
        const Request = spec['Fl32_Teq_Acl_Shared_Service_Route_User_Get#Request'];   // class constructor
        /** @type {typeof Fl32_Teq_Acl_Shared_Service_Route_User_Get_Response} */
        const Response = spec['Fl32_Teq_Acl_Shared_Service_Route_User_Get#Response'];   // class constructor


        this.getRoute = function () {
            return '/user/get';
        };

        /**
         * Create function to validate and structure incoming data.
         * @return {Function}
         */
        this.getParser = function () {
            /**
             * @param {IncomingMessage} httpReq
             * @return {Fl32_Teq_Acl_Shared_Service_Route_User_Get_Request}
             * @exports Fl32_Teq_Acl_Back_Service_User_Get$parse
             */
            function Fl32_Teq_Acl_Back_Service_User_Get$parse(httpReq) {
                const body = httpReq.body;
                // clone HTTP body into API request object
                return Object.assign(new Request(), body.data);
            }

            return Fl32_Teq_Acl_Back_Service_User_Get$parse;
        };

        /**
         * Create function to perform requested operation.
         * @return {Function}
         */
        this.getProcessor = function () {
            /**
             * @param {Fl32_Teq_Acl_Shared_Service_Route_User_Get_Request} apiReq
             * @param {IncomingMessage} httpReq
             * @return {Promise<Fl32_Teq_Acl_Shared_Service_Route_User_Get_Response>}
             * @exports Fl32_Teq_Acl_Back_Service_User_Get$process
             */
            async function Fl32_Teq_Acl_Back_Service_User_Get$process(apiReq, httpReq) {
                /** @type {Fl32_Teq_Acl_Shared_Service_Route_User_Get_Response} */
                const result = new Response();
                if (httpReq.userAcl && (httpReq.userAcl instanceof UserAcl)) {
                    result.permissions = httpReq.userAcl.permissions;
                    result.user = httpReq.userAcl.user;
                }
                return result;
            }

            return Fl32_Teq_Acl_Back_Service_User_Get$process;
        };
    }

}
