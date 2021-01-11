/**
 * Middleware to load user permissions by userId.
 */
export default class Fl32_Teq_Acl_App_Server_Permissions {

    constructor(spec) {
        /** @type {Fl32_Teq_User_Defaults} */
        const DEF_USER = spec['Fl32_Teq_User_Defaults$'];  // singleton instance
        /** @type {Fl32_Teq_Acl_App_Cache_Permissions} */
        const cache = spec['Fl32_Teq_Acl_App_Cache_Permissions$'];  // singleton instance
        /** @type {TeqFw_Core_App_Db_Connector} */
        const rdb = spec['TeqFw_Core_App_Db_Connector$'];  // singleton instance
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Permission} */
        const ePerm = spec['Fl32_Teq_Acl_Store_RDb_Schema_Permission$'];    // singleton instance
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Perm_User} */
        const ePermUser = spec['Fl32_Teq_Acl_Store_RDb_Schema_Perm_User$'];    // singleton instance
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Role_Perm} */
        const eRolePerm = spec['Fl32_Teq_Acl_Store_RDb_Schema_Role_Perm$'];    // singleton instance
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Role_User} */
        const eRoleUser = spec['Fl32_Teq_Acl_Store_RDb_Schema_Role_User$'];    // singleton instance
        /** @type {typeof Fl32_Teq_Acl_Shared_Service_Data_Permission} */
        const Permission = spec['Fl32_Teq_Acl_Shared_Service_Data_Permission#'];  // class constructor
        /** @type {typeof Fl32_Teq_Acl_Shared_Service_Data_UserAcl} */
        const UserAcl = spec['Fl32_Teq_Acl_Shared_Service_Data_UserAcl#'];  // class constructor

        /**
         * @param {IncomingMessage} req
         * @param {ServerResponse} res
         * @param next
         */
        this.handle = function (req, res, next) {
            // DEFINE INNER FUNCTIONS

            /**
             * Get all user's permissions as object {id => code}.
             * @param trx
             * @param {Number} userId
             * @return {Promise<Object<Number, String>>}
             */
            async function getPermissions(trx, userId) {
                // DEFINE INNER FUNCTIONS

                async function getRolesPermissions(trx, userId) {
                    const result = [];
                    const query = trx.from({ru: eRoleUser.ENTITY});
                    query.leftOuterJoin(
                        {rp: eRolePerm.ENTITY},
                        `rp.${eRolePerm.A_ROLE_REF}`,
                        `ru.${eRoleUser.A_ROLE_REF}`);
                    query.leftOuterJoin(
                        {p: ePerm.ENTITY},
                        `p.${ePerm.A_ID}`,
                        `rp.${eRolePerm.A_PERM_REF}`);
                    query.select([
                        {[Permission.A_ID]: `p.${ePerm.A_ID}`},
                        {[Permission.A_CODE]: `p.${ePerm.A_CODE}`},
                    ]);
                    query.where(`ru.${eRoleUser.A_USER_REF}`, userId);
                    const rows = await query;
                    for (const one of rows) {
                        const item = Object.assign(new Permission, one);
                        result.push(item);
                    }
                    return result;
                }

                async function getUserPermissions(trx, userId) {
                    const result = [];
                    const query = trx.from({pu: ePermUser.ENTITY});
                    query.leftOuterJoin(
                        {p: ePerm.ENTITY},
                        `p.${ePerm.A_ID}`,
                        `pu.${ePermUser.A_PERM_REF}`);
                    query.select([
                        {[Permission.A_ID]: `p.${ePerm.A_ID}`},
                        {[Permission.A_CODE]: `p.${ePerm.A_CODE}`},
                    ]);
                    query.where(`pu.${ePermUser.A_USER_REF}`, userId);
                    const rows = await query;
                    for (const one of rows) {
                        const item = Object.assign(new Permission, one);
                        result.push(item);
                    }
                    return result;
                }

                // MAIN FUNCTIONALITY
                const result = {};
                const permRoles = await getRolesPermissions(trx, userId);
                const permUser = await getUserPermissions(trx, userId);
                permRoles.forEach((one) => result[one[Permission.A_ID]] = one[Permission.A_CODE]);
                permUser.forEach((one) => result[one[Permission.A_ID]] = one[Permission.A_CODE]);
                return result;
            }

            // MAIN FUNCTIONALITY
            if (req[DEF_USER.HTTP_REQ_USER]) {
                /** @type {Fl32_Teq_User_Shared_Service_Data_User} */
                const user = req[DEF_USER.HTTP_REQ_USER];
                // get ACL from cache
                const perms = cache.get(user.id);
                if (perms) {
                    const userAcl = Object.assign(new UserAcl(), user);
                    userAcl.permissions = perms;
                    req[DEF_USER.HTTP_REQ_USER] = userAcl;
                    next(); // continue synchronously
                } else {
                    // get ACL asynchronously
                    rdb.startTransaction()
                        .then(async (trx) => {
                            try {
                                const perms = await getPermissions(trx, user.id);
                                const userAcl = Object.assign(new UserAcl(), user);
                                userAcl.permissions = perms;
                                req[DEF_USER.HTTP_REQ_USER] = userAcl;
                                await trx.commit();
                            } catch (e) {
                                await trx.rollback();
                                console.log('ACL middleware RDB exception: ' + e.message);
                            }
                            next();
                        })
                        .catch((e) => {
                            console.error('ACL middleware exception: ' + e.message);
                            next();
                        });
                }
            } else {
                next(); // there is no user data in request, just continue synchronously
            }
        };
    }

}
