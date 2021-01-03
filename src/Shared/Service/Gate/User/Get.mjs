/**
 * Frontend gate to '/user/get' service (get user ACL).
 */
export default function (spec) {
    const config = spec.config;
    /** @type {typeof Fl32_Teq_User_Shared_Service_Data_User} */
    const User = spec['Fl32_Teq_User_Shared_Service_Data_User#']; // class constructor
    /** @type {typeof Fl32_Teq_Acl_Shared_Service_Route_User_Get_Response} */
    const Response = spec['Fl32_Teq_Acl_Shared_Service_Route_User_Get#Response']; // class constructor
    /** @type {typeof TeqFw_Core_App_Front_Gate_Response_Error} */
    const GateError = spec['TeqFw_Core_App_Front_Gate_Response_Error#'];    // class constructor

    // TODO: we need to map gate to APU URI
    const URL = `https://${config.web.urlBase}/api/acl/user/get`;

    /**
     * We should place function separately to allow JSDoc & IDEA hints & navigation.
     *
     * @param {Fl32_Teq_Acl_Shared_Service_Route_User_Get_Request} data
     * @return {Promise<Fl32_Teq_Acl_Shared_Service_Route_User_Get_Response|TeqFw_Core_App_Front_Gate_Response_Error>}
     * @exports Fl32_Teq_Acl_Shared_Service_Gate_User_Get
     */
    async function Fl32_Teq_Acl_Shared_Service_Gate_User_Get(data) {
        try {
            const res = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({data})
            });
            const json = await res.json();
            let result;
            if (json.data) {
                // normal result
                /** @type {Fl32_Teq_Acl_Shared_Service_Route_User_Get_Response} */
                result = new Response();
                result.permissions = json.data.permissions;
                result.user = Object.assign(new User(), json.data.user);
            } else {
                // business error
                result = new GateError();
                result.message = 'Unknown business error.';
                if (json.error) {
                    result.error = Object.assign({}, json.error);
                    if (json.error.sqlMessage) result.message = json.error.sqlMessage;
                }

            }
            return result;
        } catch (e) {
            // infrastructure error
            const result = new GateError();
            result.error = Object.assign({}, e);
            if (e.message) result.message = e.message;
            return result;
        }
    }

    return Fl32_Teq_Acl_Shared_Service_Gate_User_Get;
}
