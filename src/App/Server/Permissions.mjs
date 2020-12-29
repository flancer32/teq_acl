/**
 * Middleware to load user permissions by serverId.
 */
export default class Fl32_Teq_Acl_App_Server_Permissions {

    constructor(spec) {
        /** @type {Fl32_Teq_User_Defaults} */
        const DEF_USER = spec.Fl32_Teq_User_Defaults$;  // singleton object
        /** @type {TeqFw_Core_App_Db_Connector} */
        const rdb = spec.TeqFw_Core_App_Db_Connector$;  // singleton object
        /** @type {Fl32_Teq_User_Store_RDb_Schema_Auth_Session} */
        const eAuthSess = spec.Fl32_Teq_User_Store_RDb_Schema_Auth_Session$;    // singleton object
        /** @type {Fl32_Teq_User_Store_RDb_Schema_User} */
        const eUser = spec.Fl32_Teq_User_Store_RDb_Schema_User$;                // singleton object
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Permission} */
        const ePerm = spec.Fl32_Teq_Acl_Store_RDb_Schema_Permission$;    // singleton object
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Perm_User} */
        const ePermUser = spec.Fl32_Teq_Acl_Store_RDb_Schema_Perm_User$;    // singleton object
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Role_Perm} */
        const eRolePerm = spec.Fl32_Teq_Acl_Store_RDb_Schema_Role_Perm$;    // singleton object
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Role_User} */
        const eRoleUser = spec.Fl32_Teq_Acl_Store_RDb_Schema_Role_User$;    // singleton object
        /** @type {typeof Fl32_Teq_User_Shared_Service_Data_User} */
        const User = spec['Fl32_Teq_User_Shared_Service_Data_User#'];       // class constructor
        /** @type {typeof Fl32_Teq_Acl_Shared_Service_Data_Permission} */
        const Permission = spec['Fl32_Teq_Acl_Shared_Service_Data_Permission#'];  // class constructor
        /** @type {typeof Fl32_Teq_Acl_Shared_Service_Data_UserAcl} */
        const UserAcl = spec['Fl32_Teq_Acl_Shared_Service_Data_UserAcl#'];  // class constructor
        /** @type {Fl32_Teq_User_Store_RDb_Query_GetUsers} */
        const qGetUsers = spec.Fl32_Teq_User_Store_RDb_Query_GetUsers$; // singleton object

        /**
         * @param {IncomingMessage} req
         * @param {ServerResponse} res
         * @param next
         */
        this.handle = function (req, res, next) {
            // DEFINE INNER FUNCTIONS

            /**
             * Extract session ID from cookies or HTTP headers.
             * @param {IncomingMessage} req
             * @return {null}
             */
            function extractSessionId(req) {
                let result = null;
                if (req.cookies && req.cookies[DEF_USER.SESSION_COOKIE_NAME]) {
                    // there is session cookie in request
                    result = req.cookies[DEF_USER.SESSION_COOKIE_NAME];
                } else if (req.headers && req.headers.authorization) {
                    const value = req.headers.authorization;
                    result = value.replace('Bearer ', '').trim();
                }
                return result;
            }

            /**
             * @param trx
             * @param {Number} userId
             * @return {Promise<Fl32_Teq_User_Shared_Service_Data_User|null>}
             */
            async function getUserById(trx, userId) {
                let result = null;
                const query = qGetUsers(trx);
                query.where(eUser.A_ID, userId);
                const rows = await query;
                if (rows[0]) {
                    /** @type {Fl32_Teq_User_Shared_Service_Data_User} */
                    result = Object.assign(new User(), rows[0]);
                }
                return result;
            }

            async function getUserIdBySession(trx, sessId) {
                let result = null;
                const query = trx.from(eAuthSess.ENTITY);
                query.select([eAuthSess.A_SESSION_ID, eAuthSess.A_USER_REF]);
                query.where(eAuthSess.A_SESSION_ID, sessId);
                const rows = await query;
                if (rows[0]) {
                    result = rows[0][eAuthSess.A_USER_REF];
                }
                return result;
            }

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
            const sessId = extractSessionId(req);
            if (sessId) {
                // get ACL asynchronously
                rdb.startTransaction()
                    .then(async (trx) => {
                        try {
                            const userId = await getUserIdBySession(trx, sessId);
                            const user = await getUserById(trx, userId);
                            const perms = await getPermissions(trx, userId);
                            const userAcl = new UserAcl();
                            userAcl.permissions = perms;
                            userAcl.user = user;
                            req.userAcl = userAcl;
                            await trx.commit();
                        } catch (e) {
                            await trx.rollback();
                            console.log('ACL middleware RDB exception: ' + e.message);
                        }
                        next();
                    })
                    .catch((e) => {
                        console.log('ACL middleware exception: ' + e.message);
                        next();
                    });
            } else {
                // there is no session ID in request, just continue synchronously
                next();
            }
        };
    }

}
