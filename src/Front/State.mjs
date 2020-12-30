/**
 * State for User ACL functionality.
 *
 * @return {Object}
 * @constructor
 */
export default function Fl32_Teq_Acl_Front_State(spec) {
    const gateUserGet = spec.Fl32_Teq_Acl_Shared_Service_Gate_User_Get$;
    /** @type {typeof Fl32_Teq_Acl_Shared_Service_Data_UserAcl} */
    const UserAcl = spec['Fl32_Teq_Acl_Shared_Service_Data_UserAcl#'];

    return {
        namespaced: true,
        state: {
            userAcl: UserAcl,
        },
        getters: {},
        mutations: {
            setUserAcl(state, data) {
                state.userAcl = data;
            },
        },
        actions: {

            /**
             * @param commit
             * @param {Fl32_Teq_Acl_Shared_Service_Route_User_Get_Request} req
             * @return {Promise<void>}
             */
            async loadUserAcl({commit}, req) {
                /** @type {Fl32_Teq_Acl_Shared_Service_Route_User_Get_Response} */
                const res = await gateUserGet(req);
                const user = Object.assign(new UserAcl(), res);
                commit('setUserAcl', user);
            },
        },
    };
}
