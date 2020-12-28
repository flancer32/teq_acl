export default class Fl32_Teq_Acl_Plugin_Store_RDb_Setup {
    constructor(spec) {
        const utilFKName = spec['TeqFw_Core_App_Util_Store_RDb#NameForForeignKey'];
        const utilUKName = spec['TeqFw_Core_App_Util_Store_RDb#NameForUniqueKey'];
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Permission} */
        const ePerm = spec.Fl32_Teq_Acl_Store_RDb_Schema_Permission$;
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Perm_User} */
        const ePermUser = spec.Fl32_Teq_Acl_Store_RDb_Schema_Perm_User$;
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Role_Perm} */
        const eRolePerm = spec.Fl32_Teq_Acl_Store_RDb_Schema_Role_Perm$;
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Role_User} */
        const eRoleUser = spec.Fl32_Teq_Acl_Store_RDb_Schema_Role_User$;
        /** @type {Fl32_Teq_Acl_Store_RDb_Schema_Role} */
        const eRole = spec.Fl32_Teq_Acl_Store_RDb_Schema_Role$;
        /** @type {Fl32_Teq_User_Store_RDb_Schema_User} */
        const eUser = spec.Fl32_Teq_User_Store_RDb_Schema_User$;

        /**
         * TODO: tables drop should be ordered according to relations between tables (DEM).
         * For the moment I use levels for drop: N, ..., 2, 1, 0.
         *
         * @param schema
         * @return {Promise<void>}
         */
        this.dropTables0 = async function (schema) {
            schema.dropTableIfExists(ePerm.ENTITY);
            schema.dropTableIfExists(eRole.ENTITY);
        };
        this.dropTables1 = async function (schema) {
            /* drop related tables (foreign keys) */
            schema.dropTableIfExists(ePermUser.ENTITY);
            schema.dropTableIfExists(eRolePerm.ENTITY);
            schema.dropTableIfExists(eRoleUser.ENTITY);
        };

        this.initData = async function (knex, trx) {
            // permissions
            await trx(ePerm.ENTITY).insert([
                {[ePerm.A_ID]: 1, [ePerm.A_CODE]: 'user/authenticated'},
                {[ePerm.A_ID]: 2, [ePerm.A_CODE]: 'user/manager'},
                {[ePerm.A_ID]: 3, [ePerm.A_CODE]: 'user/developer'},
            ]);
            // roles
            await trx(eRole.ENTITY).insert([
                {[eRole.A_ID]: 1, [eRole.A_CODE]: 'authenticated'},
                {[eRole.A_ID]: 2, [eRole.A_CODE]: 'manager'},
            ]);
            // permissions for roles
            await trx(eRolePerm.ENTITY).insert([
                {[eRolePerm.A_ROLE_REF]: 1, [eRolePerm.A_PERM_REF]: 1},
                {[eRolePerm.A_ROLE_REF]: 2, [eRolePerm.A_PERM_REF]: 2},
            ]);
            // users for roles
            await trx(eRoleUser.ENTITY).insert([
                {[eRoleUser.A_ROLE_REF]: 1, [eRoleUser.A_USER_REF]: 1},
                {[eRoleUser.A_ROLE_REF]: 1, [eRoleUser.A_USER_REF]: 2},
                {[eRoleUser.A_ROLE_REF]: 2, [eRoleUser.A_USER_REF]: 2},
            ]);
            // individual permissions
            await trx(ePermUser.ENTITY).insert([
                {[ePermUser.A_PERM_REF]: 1, [ePermUser.A_USER_REF]: 3},
                {[ePermUser.A_PERM_REF]: 2, [ePermUser.A_USER_REF]: 3},
                {[ePermUser.A_PERM_REF]: 3, [ePermUser.A_USER_REF]: 3},
            ]);
        };

        /**
         * Upgrade database structure (drop/create tables).
         *
         * @param knex
         * @param {SchemaBuilder} schema
         * @return {Promise<void>}
         */
        this.createStructure = async function (knex, schema) {

            // DEFINE INNER FUNCTIONS
            function createTblPermission(schema, knex) {
                schema.createTable(ePerm.ENTITY, (table) => {
                    table.increments(ePerm.A_ID);
                    table.string(ePerm.A_CODE).notNullable()
                        .comment('Unique code for permission.');
                    table.unique(ePerm.A_CODE, utilUKName(ePerm.ENTITY, ePerm.A_CODE));
                    table.comment('ACL permissions registry.');
                });
            }

            function createTblPermUser(schema, knex) {
                schema.createTable(ePermUser.ENTITY, (table) => {
                    table.integer(ePermUser.A_PERM_REF).unsigned().notNullable();
                    table.integer(ePermUser.A_USER_REF).unsigned().notNullable();
                    table.foreign(ePermUser.A_PERM_REF).references(ePerm.A_ID).inTable(ePerm.ENTITY)
                        .onDelete('CASCADE').onUpdate('CASCADE')
                        .withKeyName(utilFKName(ePermUser.ENTITY, ePermUser.A_PERM_REF, ePerm.ENTITY, ePerm.A_ID));
                    table.foreign(ePermUser.A_USER_REF).references(eUser.A_ID).inTable(eUser.ENTITY)
                        .onDelete('CASCADE').onUpdate('CASCADE')
                        .withKeyName(utilFKName(ePermUser.ENTITY, ePermUser.A_USER_REF, eUser.ENTITY, eUser.A_ID));
                    table.comment('Individual permissions for users.');

                });
            }

            function createTblRolePerm(schema, knex) {
                schema.createTable(eRolePerm.ENTITY, (table) => {
                    table.integer(eRolePerm.A_ROLE_REF).unsigned().notNullable();
                    table.integer(eRolePerm.A_PERM_REF).unsigned().notNullable();
                    table.foreign(eRolePerm.A_ROLE_REF).references(eRole.A_ID).inTable(eRole.ENTITY)
                        .onDelete('CASCADE').onUpdate('CASCADE')
                        .withKeyName(utilFKName(eRolePerm.ENTITY, eRolePerm.A_ROLE_REF, eRole.ENTITY, eRole.A_ID));
                    table.foreign(eRolePerm.A_PERM_REF).references(ePerm.A_ID).inTable(ePerm.ENTITY)
                        .onDelete('CASCADE').onUpdate('CASCADE')
                        .withKeyName(utilFKName(eRolePerm.ENTITY, eRolePerm.A_PERM_REF, ePerm.ENTITY, ePerm.A_ID));
                    table.comment('Relations between users roles and permissions.');

                });
            }

            function createTblRoleUser(schema, knex) {
                schema.createTable(eRoleUser.ENTITY, (table) => {
                    table.integer(eRoleUser.A_ROLE_REF).unsigned().notNullable();
                    table.integer(eRoleUser.A_USER_REF).unsigned().notNullable();
                    table.foreign(eRoleUser.A_ROLE_REF).references(eRole.A_ID).inTable(eRole.ENTITY)
                        .onDelete('CASCADE').onUpdate('CASCADE')
                        .withKeyName(utilFKName(eRoleUser.ENTITY, eRoleUser.A_ROLE_REF, eRole.ENTITY, eRole.A_ID));
                    table.foreign(eRoleUser.A_USER_REF).references(eUser.A_ID).inTable(eUser.ENTITY)
                        .onDelete('CASCADE').onUpdate('CASCADE')
                        .withKeyName(utilFKName(eRoleUser.ENTITY, eRoleUser.A_USER_REF, eUser.ENTITY, eUser.A_ID));
                    table.comment('Relations between roles and users.');

                });
            }

            function createTblRole(schema, knex) {
                schema.createTable(eRole.ENTITY, (table) => {
                    table.increments(eRole.A_ID);
                    table.string(eRole.A_CODE).notNullable()
                        .comment('Unique code for role.');
                    table.comment('ACL roles registry.');
                    table.unique(eRole.A_CODE, utilUKName(eRole.ENTITY, eRole.A_CODE));
                });
            }


            // MAIN FUNCTIONALITY
            // compose queries to drop existing tables
            // compose queries to create main tables (registries)
            createTblPermission(schema, knex);
            createTblRole(schema, knex);
            // compose queries to create additional tables (relations and details)
            createTblPermUser(schema, knex);
            createTblRolePerm(schema, knex);
            createTblRoleUser(schema, knex);

        };
    }
}
