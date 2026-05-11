import type { User } from "@prisma/client";
import type { Password } from "@prisma/client";
import type { Note } from "@prisma/client";
import type { Account } from "@prisma/client";
import type { BalanceSnapshot } from "@prisma/client";
import type { PlaidItem } from "@prisma/client";
import type { PlaidAccount } from "@prisma/client";
import type { PasswordResetToken } from "@prisma/client";
import type { RecoveryCode } from "@prisma/client";
import type { ContactFormSubmission } from "@prisma/client";
import type { UserRole } from "@prisma/client";
import type { AccountType } from "@prisma/client";
import type { PlaidItemHealthStatus } from "@prisma/client";
import type { Prisma, PrismaClient } from "@prisma/client";
import { createInitializer, createScreener, getScalarFieldValueGenerator, normalizeResolver, normalizeList, getSequenceCounter, createCallbackChain, destructure } from "@quramy/prisma-fabbrica/lib/internal";
import type { ModelWithFields, Resolver, } from "@quramy/prisma-fabbrica/lib/internal";
export { resetSequence, registerScalarFieldValueGenerator, resetScalarFieldValueGenerator } from "@quramy/prisma-fabbrica/lib/internal";

type BuildDataOptions<TTransients extends Record<string, unknown>> = {
    readonly seq: number;
} & TTransients;

type TraitName = string | symbol;

type CallbackDefineOptions<TCreated, TCreateInput, TTransients extends Record<string, unknown>> = {
    onAfterBuild?: (createInput: TCreateInput, transientFields: TTransients) => void | PromiseLike<void>;
    onBeforeCreate?: (createInput: TCreateInput, transientFields: TTransients) => void | PromiseLike<void>;
    onAfterCreate?: (created: TCreated, transientFields: TTransients) => void | PromiseLike<void>;
};

const initializer = createInitializer();

const { getClient } = initializer;

export const { initialize } = initializer;

const modelFieldDefinitions: ModelWithFields[] = [{
        name: "User",
        fields: [{
                name: "password",
                type: "Password",
                relationName: "PasswordToUser"
            }, {
                name: "notes",
                type: "Note",
                relationName: "NoteToUser"
            }, {
                name: "accounts",
                type: "Account",
                relationName: "AccountToUser"
            }, {
                name: "plaidItems",
                type: "PlaidItem",
                relationName: "PlaidItemToUser"
            }, {
                name: "passwordResetTokens",
                type: "PasswordResetToken",
                relationName: "PasswordResetTokenToUser"
            }, {
                name: "recoveryCodes",
                type: "RecoveryCode",
                relationName: "RecoveryCodeToUser"
            }]
    }, {
        name: "Password",
        fields: [{
                name: "user",
                type: "User",
                relationName: "PasswordToUser"
            }]
    }, {
        name: "Note",
        fields: [{
                name: "user",
                type: "User",
                relationName: "NoteToUser"
            }]
    }, {
        name: "Account",
        fields: [{
                name: "user",
                type: "User",
                relationName: "AccountToUser"
            }, {
                name: "balanceSnapshots",
                type: "BalanceSnapshot",
                relationName: "AccountToBalanceSnapshot"
            }, {
                name: "plaidAccount",
                type: "PlaidAccount",
                relationName: "AccountToPlaidAccount"
            }]
    }, {
        name: "BalanceSnapshot",
        fields: [{
                name: "account",
                type: "Account",
                relationName: "AccountToBalanceSnapshot"
            }]
    }, {
        name: "PlaidItem",
        fields: [{
                name: "user",
                type: "User",
                relationName: "PlaidItemToUser"
            }, {
                name: "plaidAccounts",
                type: "PlaidAccount",
                relationName: "PlaidAccountToPlaidItem"
            }]
    }, {
        name: "PlaidAccount",
        fields: [{
                name: "plaidItem",
                type: "PlaidItem",
                relationName: "PlaidAccountToPlaidItem"
            }, {
                name: "account",
                type: "Account",
                relationName: "AccountToPlaidAccount"
            }]
    }, {
        name: "PasswordResetToken",
        fields: [{
                name: "user",
                type: "User",
                relationName: "PasswordResetTokenToUser"
            }]
    }, {
        name: "RecoveryCode",
        fields: [{
                name: "user",
                type: "User",
                relationName: "RecoveryCodeToUser"
            }]
    }, {
        name: "ContactFormSubmission",
        fields: []
    }];

type UserScalarOrEnumFields = {
    email: string;
    firstName: string;
    lastName: string;
};

type UserpasswordFactory = {
    _factoryFor: "Password";
    build: () => PromiseLike<Prisma.PasswordCreateNestedOneWithoutUserInput["create"]>;
};

type UserFactoryDefineInput = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    email?: string;
    firstName?: string;
    lastName?: string;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string | null;
    role?: UserRole;
    password?: UserpasswordFactory | Prisma.PasswordCreateNestedOneWithoutUserInput;
    notes?: Prisma.NoteCreateNestedManyWithoutUserInput;
    accounts?: Prisma.AccountCreateNestedManyWithoutUserInput;
    plaidItems?: Prisma.PlaidItemCreateNestedManyWithoutUserInput;
    passwordResetTokens?: Prisma.PasswordResetTokenCreateNestedManyWithoutUserInput;
    recoveryCodes?: Prisma.RecoveryCodeCreateNestedManyWithoutUserInput;
};

type UserTransientFields = Record<string, unknown> & Partial<Record<keyof UserFactoryDefineInput, never>>;

type UserFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<UserFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<User, Prisma.UserCreateInput, TTransients>;

type UserFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<UserFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: UserFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<User, Prisma.UserCreateInput, TTransients>;

function isUserpasswordFactory(x: UserpasswordFactory | Prisma.PasswordCreateNestedOneWithoutUserInput | undefined): x is UserpasswordFactory {
    return (x as any)?._factoryFor === "Password";
}

type UserTraitKeys<TOptions extends UserFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface UserFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "User";
    build(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput>;
    buildList(list: readonly Partial<Prisma.UserCreateInput & TTransients>[]): PromiseLike<Prisma.UserCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput[]>;
    pickForConnect(inputData: User): Pick<User, "id">;
    create(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<User>;
    createList(list: readonly Partial<Prisma.UserCreateInput & TTransients>[]): PromiseLike<User[]>;
    createList(count: number, item?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<User[]>;
    createForConnect(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Pick<User, "id">>;
}

export interface UserFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends UserFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): UserFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateUserScalarsOrEnums({ seq }: {
    readonly seq: number;
}): UserScalarOrEnumFields {
    return {
        email: getScalarFieldValueGenerator().String({ modelName: "User", fieldName: "email", isId: false, isUnique: true, seq }),
        firstName: getScalarFieldValueGenerator().String({ modelName: "User", fieldName: "firstName", isId: false, isUnique: false, seq }),
        lastName: getScalarFieldValueGenerator().String({ modelName: "User", fieldName: "lastName", isId: false, isUnique: false, seq })
    };
}

function defineUserFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends UserFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): UserFactoryInterface<TTransients, UserTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly UserTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("User", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.UserCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateUserScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<UserFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<UserFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                password: isUserpasswordFactory(defaultData.password) ? {
                    create: await defaultData.password.build()
                } : defaultData.password
            } as Prisma.UserCreateInput;
            const data: Prisma.UserCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.UserCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: User) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.UserCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().user.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.UserCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.UserCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "User" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: UserTraitKeys<TOptions>, ...names: readonly UserTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface UserFactoryBuilder {
    <TOptions extends UserFactoryDefineOptions>(options?: TOptions): UserFactoryInterface<{}, UserTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends UserTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends UserFactoryDefineOptions<TTransients>>(options?: TOptions) => UserFactoryInterface<TTransients, UserTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link User} model.
 *
 * @param options
 * @returns factory {@link UserFactoryInterface}
 */
export const defineUserFactory = (<TOptions extends UserFactoryDefineOptions>(options?: TOptions): UserFactoryInterface<TOptions> => {
    return defineUserFactoryInternal(options ?? {}, {});
}) as UserFactoryBuilder;

defineUserFactory.withTransientFields = defaultTransientFieldValues => options => defineUserFactoryInternal(options ?? {}, defaultTransientFieldValues);

type PasswordScalarOrEnumFields = {
    hash: string;
};

type PassworduserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutPasswordInput["create"]>;
};

type PasswordFactoryDefineInput = {
    hash?: string;
    user: PassworduserFactory | Prisma.UserCreateNestedOneWithoutPasswordInput;
};

type PasswordTransientFields = Record<string, unknown> & Partial<Record<keyof PasswordFactoryDefineInput, never>>;

type PasswordFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<PasswordFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Password, Prisma.PasswordCreateInput, TTransients>;

type PasswordFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<PasswordFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: PasswordFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Password, Prisma.PasswordCreateInput, TTransients>;

function isPassworduserFactory(x: PassworduserFactory | Prisma.UserCreateNestedOneWithoutPasswordInput | undefined): x is PassworduserFactory {
    return (x as any)?._factoryFor === "User";
}

type PasswordTraitKeys<TOptions extends PasswordFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface PasswordFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Password";
    build(inputData?: Partial<Prisma.PasswordCreateInput & TTransients>): PromiseLike<Prisma.PasswordCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.PasswordCreateInput & TTransients>): PromiseLike<Prisma.PasswordCreateInput>;
    buildList(list: readonly Partial<Prisma.PasswordCreateInput & TTransients>[]): PromiseLike<Prisma.PasswordCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.PasswordCreateInput & TTransients>): PromiseLike<Prisma.PasswordCreateInput[]>;
    pickForConnect(inputData: Password): Pick<Password, "userId">;
    create(inputData?: Partial<Prisma.PasswordCreateInput & TTransients>): PromiseLike<Password>;
    createList(list: readonly Partial<Prisma.PasswordCreateInput & TTransients>[]): PromiseLike<Password[]>;
    createList(count: number, item?: Partial<Prisma.PasswordCreateInput & TTransients>): PromiseLike<Password[]>;
    createForConnect(inputData?: Partial<Prisma.PasswordCreateInput & TTransients>): PromiseLike<Pick<Password, "userId">>;
}

export interface PasswordFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends PasswordFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): PasswordFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGeneratePasswordScalarsOrEnums({ seq }: {
    readonly seq: number;
}): PasswordScalarOrEnumFields {
    return {
        hash: getScalarFieldValueGenerator().String({ modelName: "Password", fieldName: "hash", isId: false, isUnique: false, seq })
    };
}

function definePasswordFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends PasswordFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): PasswordFactoryInterface<TTransients, PasswordTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly PasswordTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Password", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.PasswordCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGeneratePasswordScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<PasswordFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<PasswordFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isPassworduserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.PasswordCreateInput;
            const data: Prisma.PasswordCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PasswordCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Password) => ({
            userId: inputData.userId
        });
        const create = async (inputData: Partial<Prisma.PasswordCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().password.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PasswordCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.PasswordCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Password" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: PasswordTraitKeys<TOptions>, ...names: readonly PasswordTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface PasswordFactoryBuilder {
    <TOptions extends PasswordFactoryDefineOptions>(options: TOptions): PasswordFactoryInterface<{}, PasswordTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends PasswordTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends PasswordFactoryDefineOptions<TTransients>>(options: TOptions) => PasswordFactoryInterface<TTransients, PasswordTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Password} model.
 *
 * @param options
 * @returns factory {@link PasswordFactoryInterface}
 */
export const definePasswordFactory = (<TOptions extends PasswordFactoryDefineOptions>(options: TOptions): PasswordFactoryInterface<TOptions> => {
    return definePasswordFactoryInternal(options, {});
}) as PasswordFactoryBuilder;

definePasswordFactory.withTransientFields = defaultTransientFieldValues => options => definePasswordFactoryInternal(options, defaultTransientFieldValues);

type NoteScalarOrEnumFields = {
    title: string;
    body: string;
};

type NoteuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutNotesInput["create"]>;
};

type NoteFactoryDefineInput = {
    id?: string;
    title?: string;
    body?: string;
    createdAt?: Date;
    updatedAt?: Date;
    user: NoteuserFactory | Prisma.UserCreateNestedOneWithoutNotesInput;
};

type NoteTransientFields = Record<string, unknown> & Partial<Record<keyof NoteFactoryDefineInput, never>>;

type NoteFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<NoteFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Note, Prisma.NoteCreateInput, TTransients>;

type NoteFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<NoteFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: NoteFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Note, Prisma.NoteCreateInput, TTransients>;

function isNoteuserFactory(x: NoteuserFactory | Prisma.UserCreateNestedOneWithoutNotesInput | undefined): x is NoteuserFactory {
    return (x as any)?._factoryFor === "User";
}

type NoteTraitKeys<TOptions extends NoteFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface NoteFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Note";
    build(inputData?: Partial<Prisma.NoteCreateInput & TTransients>): PromiseLike<Prisma.NoteCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.NoteCreateInput & TTransients>): PromiseLike<Prisma.NoteCreateInput>;
    buildList(list: readonly Partial<Prisma.NoteCreateInput & TTransients>[]): PromiseLike<Prisma.NoteCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.NoteCreateInput & TTransients>): PromiseLike<Prisma.NoteCreateInput[]>;
    pickForConnect(inputData: Note): Pick<Note, "id">;
    create(inputData?: Partial<Prisma.NoteCreateInput & TTransients>): PromiseLike<Note>;
    createList(list: readonly Partial<Prisma.NoteCreateInput & TTransients>[]): PromiseLike<Note[]>;
    createList(count: number, item?: Partial<Prisma.NoteCreateInput & TTransients>): PromiseLike<Note[]>;
    createForConnect(inputData?: Partial<Prisma.NoteCreateInput & TTransients>): PromiseLike<Pick<Note, "id">>;
}

export interface NoteFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends NoteFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): NoteFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateNoteScalarsOrEnums({ seq }: {
    readonly seq: number;
}): NoteScalarOrEnumFields {
    return {
        title: getScalarFieldValueGenerator().String({ modelName: "Note", fieldName: "title", isId: false, isUnique: false, seq }),
        body: getScalarFieldValueGenerator().String({ modelName: "Note", fieldName: "body", isId: false, isUnique: false, seq })
    };
}

function defineNoteFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends NoteFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): NoteFactoryInterface<TTransients, NoteTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly NoteTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Note", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.NoteCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateNoteScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<NoteFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<NoteFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isNoteuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.NoteCreateInput;
            const data: Prisma.NoteCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NoteCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Note) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.NoteCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().note.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NoteCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.NoteCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Note" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: NoteTraitKeys<TOptions>, ...names: readonly NoteTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface NoteFactoryBuilder {
    <TOptions extends NoteFactoryDefineOptions>(options: TOptions): NoteFactoryInterface<{}, NoteTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends NoteTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends NoteFactoryDefineOptions<TTransients>>(options: TOptions) => NoteFactoryInterface<TTransients, NoteTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Note} model.
 *
 * @param options
 * @returns factory {@link NoteFactoryInterface}
 */
export const defineNoteFactory = (<TOptions extends NoteFactoryDefineOptions>(options: TOptions): NoteFactoryInterface<TOptions> => {
    return defineNoteFactoryInternal(options, {});
}) as NoteFactoryBuilder;

defineNoteFactory.withTransientFields = defaultTransientFieldValues => options => defineNoteFactoryInternal(options, defaultTransientFieldValues);

type AccountScalarOrEnumFields = {};

type AccountuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutAccountsInput["create"]>;
};

type AccountplaidAccountFactory = {
    _factoryFor: "PlaidAccount";
    build: () => PromiseLike<Prisma.PlaidAccountCreateNestedOneWithoutAccountInput["create"]>;
};

type AccountFactoryDefineInput = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    closedAt?: Date | null;
    customName?: string | null;
    type?: AccountType;
    user: AccountuserFactory | Prisma.UserCreateNestedOneWithoutAccountsInput;
    balanceSnapshots?: Prisma.BalanceSnapshotCreateNestedManyWithoutAccountInput;
    plaidAccount?: AccountplaidAccountFactory | Prisma.PlaidAccountCreateNestedOneWithoutAccountInput;
};

type AccountTransientFields = Record<string, unknown> & Partial<Record<keyof AccountFactoryDefineInput, never>>;

type AccountFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<AccountFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Account, Prisma.AccountCreateInput, TTransients>;

type AccountFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<AccountFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: AccountFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Account, Prisma.AccountCreateInput, TTransients>;

function isAccountuserFactory(x: AccountuserFactory | Prisma.UserCreateNestedOneWithoutAccountsInput | undefined): x is AccountuserFactory {
    return (x as any)?._factoryFor === "User";
}

function isAccountplaidAccountFactory(x: AccountplaidAccountFactory | Prisma.PlaidAccountCreateNestedOneWithoutAccountInput | undefined): x is AccountplaidAccountFactory {
    return (x as any)?._factoryFor === "PlaidAccount";
}

type AccountTraitKeys<TOptions extends AccountFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface AccountFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Account";
    build(inputData?: Partial<Prisma.AccountCreateInput & TTransients>): PromiseLike<Prisma.AccountCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.AccountCreateInput & TTransients>): PromiseLike<Prisma.AccountCreateInput>;
    buildList(list: readonly Partial<Prisma.AccountCreateInput & TTransients>[]): PromiseLike<Prisma.AccountCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.AccountCreateInput & TTransients>): PromiseLike<Prisma.AccountCreateInput[]>;
    pickForConnect(inputData: Account): Pick<Account, "id">;
    create(inputData?: Partial<Prisma.AccountCreateInput & TTransients>): PromiseLike<Account>;
    createList(list: readonly Partial<Prisma.AccountCreateInput & TTransients>[]): PromiseLike<Account[]>;
    createList(count: number, item?: Partial<Prisma.AccountCreateInput & TTransients>): PromiseLike<Account[]>;
    createForConnect(inputData?: Partial<Prisma.AccountCreateInput & TTransients>): PromiseLike<Pick<Account, "id">>;
}

export interface AccountFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends AccountFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): AccountFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateAccountScalarsOrEnums({ seq }: {
    readonly seq: number;
}): AccountScalarOrEnumFields {
    return {};
}

function defineAccountFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends AccountFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): AccountFactoryInterface<TTransients, AccountTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly AccountTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Account", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.AccountCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateAccountScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<AccountFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<AccountFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isAccountuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                plaidAccount: isAccountplaidAccountFactory(defaultData.plaidAccount) ? {
                    create: await defaultData.plaidAccount.build()
                } : defaultData.plaidAccount
            } as Prisma.AccountCreateInput;
            const data: Prisma.AccountCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.AccountCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Account) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.AccountCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().account.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.AccountCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.AccountCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Account" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: AccountTraitKeys<TOptions>, ...names: readonly AccountTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface AccountFactoryBuilder {
    <TOptions extends AccountFactoryDefineOptions>(options: TOptions): AccountFactoryInterface<{}, AccountTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends AccountTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends AccountFactoryDefineOptions<TTransients>>(options: TOptions) => AccountFactoryInterface<TTransients, AccountTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Account} model.
 *
 * @param options
 * @returns factory {@link AccountFactoryInterface}
 */
export const defineAccountFactory = (<TOptions extends AccountFactoryDefineOptions>(options: TOptions): AccountFactoryInterface<TOptions> => {
    return defineAccountFactoryInternal(options, {});
}) as AccountFactoryBuilder;

defineAccountFactory.withTransientFields = defaultTransientFieldValues => options => defineAccountFactoryInternal(options, defaultTransientFieldValues);

type BalanceSnapshotScalarOrEnumFields = {
    amount: number;
    dateTime: Date;
};

type BalanceSnapshotaccountFactory = {
    _factoryFor: "Account";
    build: () => PromiseLike<Prisma.AccountCreateNestedOneWithoutBalanceSnapshotsInput["create"]>;
};

type BalanceSnapshotFactoryDefineInput = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    amount?: number;
    dateTime?: Date;
    account: BalanceSnapshotaccountFactory | Prisma.AccountCreateNestedOneWithoutBalanceSnapshotsInput;
};

type BalanceSnapshotTransientFields = Record<string, unknown> & Partial<Record<keyof BalanceSnapshotFactoryDefineInput, never>>;

type BalanceSnapshotFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<BalanceSnapshotFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<BalanceSnapshot, Prisma.BalanceSnapshotCreateInput, TTransients>;

type BalanceSnapshotFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<BalanceSnapshotFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: BalanceSnapshotFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<BalanceSnapshot, Prisma.BalanceSnapshotCreateInput, TTransients>;

function isBalanceSnapshotaccountFactory(x: BalanceSnapshotaccountFactory | Prisma.AccountCreateNestedOneWithoutBalanceSnapshotsInput | undefined): x is BalanceSnapshotaccountFactory {
    return (x as any)?._factoryFor === "Account";
}

type BalanceSnapshotTraitKeys<TOptions extends BalanceSnapshotFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface BalanceSnapshotFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "BalanceSnapshot";
    build(inputData?: Partial<Prisma.BalanceSnapshotCreateInput & TTransients>): PromiseLike<Prisma.BalanceSnapshotCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.BalanceSnapshotCreateInput & TTransients>): PromiseLike<Prisma.BalanceSnapshotCreateInput>;
    buildList(list: readonly Partial<Prisma.BalanceSnapshotCreateInput & TTransients>[]): PromiseLike<Prisma.BalanceSnapshotCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.BalanceSnapshotCreateInput & TTransients>): PromiseLike<Prisma.BalanceSnapshotCreateInput[]>;
    pickForConnect(inputData: BalanceSnapshot): Pick<BalanceSnapshot, "id">;
    create(inputData?: Partial<Prisma.BalanceSnapshotCreateInput & TTransients>): PromiseLike<BalanceSnapshot>;
    createList(list: readonly Partial<Prisma.BalanceSnapshotCreateInput & TTransients>[]): PromiseLike<BalanceSnapshot[]>;
    createList(count: number, item?: Partial<Prisma.BalanceSnapshotCreateInput & TTransients>): PromiseLike<BalanceSnapshot[]>;
    createForConnect(inputData?: Partial<Prisma.BalanceSnapshotCreateInput & TTransients>): PromiseLike<Pick<BalanceSnapshot, "id">>;
}

export interface BalanceSnapshotFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends BalanceSnapshotFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): BalanceSnapshotFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateBalanceSnapshotScalarsOrEnums({ seq }: {
    readonly seq: number;
}): BalanceSnapshotScalarOrEnumFields {
    return {
        amount: getScalarFieldValueGenerator().Int({ modelName: "BalanceSnapshot", fieldName: "amount", isId: false, isUnique: false, seq }),
        dateTime: getScalarFieldValueGenerator().DateTime({ modelName: "BalanceSnapshot", fieldName: "dateTime", isId: false, isUnique: false, seq })
    };
}

function defineBalanceSnapshotFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends BalanceSnapshotFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): BalanceSnapshotFactoryInterface<TTransients, BalanceSnapshotTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly BalanceSnapshotTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("BalanceSnapshot", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.BalanceSnapshotCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateBalanceSnapshotScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<BalanceSnapshotFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<BalanceSnapshotFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                account: isBalanceSnapshotaccountFactory(defaultData.account) ? {
                    create: await defaultData.account.build()
                } : defaultData.account
            } as Prisma.BalanceSnapshotCreateInput;
            const data: Prisma.BalanceSnapshotCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.BalanceSnapshotCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: BalanceSnapshot) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.BalanceSnapshotCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().balanceSnapshot.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.BalanceSnapshotCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.BalanceSnapshotCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "BalanceSnapshot" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: BalanceSnapshotTraitKeys<TOptions>, ...names: readonly BalanceSnapshotTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface BalanceSnapshotFactoryBuilder {
    <TOptions extends BalanceSnapshotFactoryDefineOptions>(options: TOptions): BalanceSnapshotFactoryInterface<{}, BalanceSnapshotTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends BalanceSnapshotTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends BalanceSnapshotFactoryDefineOptions<TTransients>>(options: TOptions) => BalanceSnapshotFactoryInterface<TTransients, BalanceSnapshotTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link BalanceSnapshot} model.
 *
 * @param options
 * @returns factory {@link BalanceSnapshotFactoryInterface}
 */
export const defineBalanceSnapshotFactory = (<TOptions extends BalanceSnapshotFactoryDefineOptions>(options: TOptions): BalanceSnapshotFactoryInterface<TOptions> => {
    return defineBalanceSnapshotFactoryInternal(options, {});
}) as BalanceSnapshotFactoryBuilder;

defineBalanceSnapshotFactory.withTransientFields = defaultTransientFieldValues => options => defineBalanceSnapshotFactoryInternal(options, defaultTransientFieldValues);

type PlaidItemScalarOrEnumFields = {
    status: PlaidItemHealthStatus;
    plaidItemId: string;
    accessToken: string;
    institutionId: string;
    institutionName: string;
};

type PlaidItemuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutPlaidItemsInput["create"]>;
};

type PlaidItemFactoryDefineInput = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    status?: PlaidItemHealthStatus;
    plaidItemId?: string;
    accessToken?: string;
    institutionId?: string;
    institutionName?: string;
    user: PlaidItemuserFactory | Prisma.UserCreateNestedOneWithoutPlaidItemsInput;
    plaidAccounts?: Prisma.PlaidAccountCreateNestedManyWithoutPlaidItemInput;
};

type PlaidItemTransientFields = Record<string, unknown> & Partial<Record<keyof PlaidItemFactoryDefineInput, never>>;

type PlaidItemFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<PlaidItemFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<PlaidItem, Prisma.PlaidItemCreateInput, TTransients>;

type PlaidItemFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<PlaidItemFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: PlaidItemFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<PlaidItem, Prisma.PlaidItemCreateInput, TTransients>;

function isPlaidItemuserFactory(x: PlaidItemuserFactory | Prisma.UserCreateNestedOneWithoutPlaidItemsInput | undefined): x is PlaidItemuserFactory {
    return (x as any)?._factoryFor === "User";
}

type PlaidItemTraitKeys<TOptions extends PlaidItemFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface PlaidItemFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "PlaidItem";
    build(inputData?: Partial<Prisma.PlaidItemCreateInput & TTransients>): PromiseLike<Prisma.PlaidItemCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.PlaidItemCreateInput & TTransients>): PromiseLike<Prisma.PlaidItemCreateInput>;
    buildList(list: readonly Partial<Prisma.PlaidItemCreateInput & TTransients>[]): PromiseLike<Prisma.PlaidItemCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.PlaidItemCreateInput & TTransients>): PromiseLike<Prisma.PlaidItemCreateInput[]>;
    pickForConnect(inputData: PlaidItem): Pick<PlaidItem, "id">;
    create(inputData?: Partial<Prisma.PlaidItemCreateInput & TTransients>): PromiseLike<PlaidItem>;
    createList(list: readonly Partial<Prisma.PlaidItemCreateInput & TTransients>[]): PromiseLike<PlaidItem[]>;
    createList(count: number, item?: Partial<Prisma.PlaidItemCreateInput & TTransients>): PromiseLike<PlaidItem[]>;
    createForConnect(inputData?: Partial<Prisma.PlaidItemCreateInput & TTransients>): PromiseLike<Pick<PlaidItem, "id">>;
}

export interface PlaidItemFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends PlaidItemFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): PlaidItemFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGeneratePlaidItemScalarsOrEnums({ seq }: {
    readonly seq: number;
}): PlaidItemScalarOrEnumFields {
    return {
        status: "healthy",
        plaidItemId: getScalarFieldValueGenerator().String({ modelName: "PlaidItem", fieldName: "plaidItemId", isId: false, isUnique: false, seq }),
        accessToken: getScalarFieldValueGenerator().String({ modelName: "PlaidItem", fieldName: "accessToken", isId: false, isUnique: false, seq }),
        institutionId: getScalarFieldValueGenerator().String({ modelName: "PlaidItem", fieldName: "institutionId", isId: false, isUnique: false, seq }),
        institutionName: getScalarFieldValueGenerator().String({ modelName: "PlaidItem", fieldName: "institutionName", isId: false, isUnique: false, seq })
    };
}

function definePlaidItemFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends PlaidItemFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): PlaidItemFactoryInterface<TTransients, PlaidItemTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly PlaidItemTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("PlaidItem", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.PlaidItemCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGeneratePlaidItemScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<PlaidItemFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<PlaidItemFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isPlaidItemuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.PlaidItemCreateInput;
            const data: Prisma.PlaidItemCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PlaidItemCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: PlaidItem) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.PlaidItemCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().plaidItem.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PlaidItemCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.PlaidItemCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "PlaidItem" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: PlaidItemTraitKeys<TOptions>, ...names: readonly PlaidItemTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface PlaidItemFactoryBuilder {
    <TOptions extends PlaidItemFactoryDefineOptions>(options: TOptions): PlaidItemFactoryInterface<{}, PlaidItemTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends PlaidItemTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends PlaidItemFactoryDefineOptions<TTransients>>(options: TOptions) => PlaidItemFactoryInterface<TTransients, PlaidItemTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link PlaidItem} model.
 *
 * @param options
 * @returns factory {@link PlaidItemFactoryInterface}
 */
export const definePlaidItemFactory = (<TOptions extends PlaidItemFactoryDefineOptions>(options: TOptions): PlaidItemFactoryInterface<TOptions> => {
    return definePlaidItemFactoryInternal(options, {});
}) as PlaidItemFactoryBuilder;

definePlaidItemFactory.withTransientFields = defaultTransientFieldValues => options => definePlaidItemFactoryInternal(options, defaultTransientFieldValues);

type PlaidAccountScalarOrEnumFields = {
    plaidAccountId: string;
    officialName: string;
    name: string;
    mask: string;
    type: string;
};

type PlaidAccountplaidItemFactory = {
    _factoryFor: "PlaidItem";
    build: () => PromiseLike<Prisma.PlaidItemCreateNestedOneWithoutPlaidAccountsInput["create"]>;
};

type PlaidAccountaccountFactory = {
    _factoryFor: "Account";
    build: () => PromiseLike<Prisma.AccountCreateNestedOneWithoutPlaidAccountInput["create"]>;
};

type PlaidAccountFactoryDefineInput = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    plaidAccountId?: string;
    officialName?: string;
    name?: string;
    mask?: string;
    type?: string;
    subtype?: string | null;
    plaidItem: PlaidAccountplaidItemFactory | Prisma.PlaidItemCreateNestedOneWithoutPlaidAccountsInput;
    account: PlaidAccountaccountFactory | Prisma.AccountCreateNestedOneWithoutPlaidAccountInput;
};

type PlaidAccountTransientFields = Record<string, unknown> & Partial<Record<keyof PlaidAccountFactoryDefineInput, never>>;

type PlaidAccountFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<PlaidAccountFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<PlaidAccount, Prisma.PlaidAccountCreateInput, TTransients>;

type PlaidAccountFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<PlaidAccountFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: PlaidAccountFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<PlaidAccount, Prisma.PlaidAccountCreateInput, TTransients>;

function isPlaidAccountplaidItemFactory(x: PlaidAccountplaidItemFactory | Prisma.PlaidItemCreateNestedOneWithoutPlaidAccountsInput | undefined): x is PlaidAccountplaidItemFactory {
    return (x as any)?._factoryFor === "PlaidItem";
}

function isPlaidAccountaccountFactory(x: PlaidAccountaccountFactory | Prisma.AccountCreateNestedOneWithoutPlaidAccountInput | undefined): x is PlaidAccountaccountFactory {
    return (x as any)?._factoryFor === "Account";
}

type PlaidAccountTraitKeys<TOptions extends PlaidAccountFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface PlaidAccountFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "PlaidAccount";
    build(inputData?: Partial<Prisma.PlaidAccountCreateInput & TTransients>): PromiseLike<Prisma.PlaidAccountCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.PlaidAccountCreateInput & TTransients>): PromiseLike<Prisma.PlaidAccountCreateInput>;
    buildList(list: readonly Partial<Prisma.PlaidAccountCreateInput & TTransients>[]): PromiseLike<Prisma.PlaidAccountCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.PlaidAccountCreateInput & TTransients>): PromiseLike<Prisma.PlaidAccountCreateInput[]>;
    pickForConnect(inputData: PlaidAccount): Pick<PlaidAccount, "id">;
    create(inputData?: Partial<Prisma.PlaidAccountCreateInput & TTransients>): PromiseLike<PlaidAccount>;
    createList(list: readonly Partial<Prisma.PlaidAccountCreateInput & TTransients>[]): PromiseLike<PlaidAccount[]>;
    createList(count: number, item?: Partial<Prisma.PlaidAccountCreateInput & TTransients>): PromiseLike<PlaidAccount[]>;
    createForConnect(inputData?: Partial<Prisma.PlaidAccountCreateInput & TTransients>): PromiseLike<Pick<PlaidAccount, "id">>;
}

export interface PlaidAccountFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends PlaidAccountFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): PlaidAccountFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGeneratePlaidAccountScalarsOrEnums({ seq }: {
    readonly seq: number;
}): PlaidAccountScalarOrEnumFields {
    return {
        plaidAccountId: getScalarFieldValueGenerator().String({ modelName: "PlaidAccount", fieldName: "plaidAccountId", isId: false, isUnique: false, seq }),
        officialName: getScalarFieldValueGenerator().String({ modelName: "PlaidAccount", fieldName: "officialName", isId: false, isUnique: false, seq }),
        name: getScalarFieldValueGenerator().String({ modelName: "PlaidAccount", fieldName: "name", isId: false, isUnique: false, seq }),
        mask: getScalarFieldValueGenerator().String({ modelName: "PlaidAccount", fieldName: "mask", isId: false, isUnique: false, seq }),
        type: getScalarFieldValueGenerator().String({ modelName: "PlaidAccount", fieldName: "type", isId: false, isUnique: false, seq })
    };
}

function definePlaidAccountFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends PlaidAccountFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): PlaidAccountFactoryInterface<TTransients, PlaidAccountTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly PlaidAccountTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("PlaidAccount", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.PlaidAccountCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGeneratePlaidAccountScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<PlaidAccountFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<PlaidAccountFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                plaidItem: isPlaidAccountplaidItemFactory(defaultData.plaidItem) ? {
                    create: await defaultData.plaidItem.build()
                } : defaultData.plaidItem,
                account: isPlaidAccountaccountFactory(defaultData.account) ? {
                    create: await defaultData.account.build()
                } : defaultData.account
            } as Prisma.PlaidAccountCreateInput;
            const data: Prisma.PlaidAccountCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PlaidAccountCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: PlaidAccount) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.PlaidAccountCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().plaidAccount.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PlaidAccountCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.PlaidAccountCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "PlaidAccount" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: PlaidAccountTraitKeys<TOptions>, ...names: readonly PlaidAccountTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface PlaidAccountFactoryBuilder {
    <TOptions extends PlaidAccountFactoryDefineOptions>(options: TOptions): PlaidAccountFactoryInterface<{}, PlaidAccountTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends PlaidAccountTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends PlaidAccountFactoryDefineOptions<TTransients>>(options: TOptions) => PlaidAccountFactoryInterface<TTransients, PlaidAccountTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link PlaidAccount} model.
 *
 * @param options
 * @returns factory {@link PlaidAccountFactoryInterface}
 */
export const definePlaidAccountFactory = (<TOptions extends PlaidAccountFactoryDefineOptions>(options: TOptions): PlaidAccountFactoryInterface<TOptions> => {
    return definePlaidAccountFactoryInternal(options, {});
}) as PlaidAccountFactoryBuilder;

definePlaidAccountFactory.withTransientFields = defaultTransientFieldValues => options => definePlaidAccountFactoryInternal(options, defaultTransientFieldValues);

type PasswordResetTokenScalarOrEnumFields = {
    tokenHash: string;
    expiresAt: Date;
};

type PasswordResetTokenuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutPasswordResetTokensInput["create"]>;
};

type PasswordResetTokenFactoryDefineInput = {
    id?: string;
    createdAt?: Date;
    tokenHash?: string;
    expiresAt?: Date;
    usedAt?: Date | null;
    user: PasswordResetTokenuserFactory | Prisma.UserCreateNestedOneWithoutPasswordResetTokensInput;
};

type PasswordResetTokenTransientFields = Record<string, unknown> & Partial<Record<keyof PasswordResetTokenFactoryDefineInput, never>>;

type PasswordResetTokenFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<PasswordResetTokenFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<PasswordResetToken, Prisma.PasswordResetTokenCreateInput, TTransients>;

type PasswordResetTokenFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<PasswordResetTokenFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: PasswordResetTokenFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<PasswordResetToken, Prisma.PasswordResetTokenCreateInput, TTransients>;

function isPasswordResetTokenuserFactory(x: PasswordResetTokenuserFactory | Prisma.UserCreateNestedOneWithoutPasswordResetTokensInput | undefined): x is PasswordResetTokenuserFactory {
    return (x as any)?._factoryFor === "User";
}

type PasswordResetTokenTraitKeys<TOptions extends PasswordResetTokenFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface PasswordResetTokenFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "PasswordResetToken";
    build(inputData?: Partial<Prisma.PasswordResetTokenCreateInput & TTransients>): PromiseLike<Prisma.PasswordResetTokenCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.PasswordResetTokenCreateInput & TTransients>): PromiseLike<Prisma.PasswordResetTokenCreateInput>;
    buildList(list: readonly Partial<Prisma.PasswordResetTokenCreateInput & TTransients>[]): PromiseLike<Prisma.PasswordResetTokenCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.PasswordResetTokenCreateInput & TTransients>): PromiseLike<Prisma.PasswordResetTokenCreateInput[]>;
    pickForConnect(inputData: PasswordResetToken): Pick<PasswordResetToken, "id">;
    create(inputData?: Partial<Prisma.PasswordResetTokenCreateInput & TTransients>): PromiseLike<PasswordResetToken>;
    createList(list: readonly Partial<Prisma.PasswordResetTokenCreateInput & TTransients>[]): PromiseLike<PasswordResetToken[]>;
    createList(count: number, item?: Partial<Prisma.PasswordResetTokenCreateInput & TTransients>): PromiseLike<PasswordResetToken[]>;
    createForConnect(inputData?: Partial<Prisma.PasswordResetTokenCreateInput & TTransients>): PromiseLike<Pick<PasswordResetToken, "id">>;
}

export interface PasswordResetTokenFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends PasswordResetTokenFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): PasswordResetTokenFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGeneratePasswordResetTokenScalarsOrEnums({ seq }: {
    readonly seq: number;
}): PasswordResetTokenScalarOrEnumFields {
    return {
        tokenHash: getScalarFieldValueGenerator().String({ modelName: "PasswordResetToken", fieldName: "tokenHash", isId: false, isUnique: true, seq }),
        expiresAt: getScalarFieldValueGenerator().DateTime({ modelName: "PasswordResetToken", fieldName: "expiresAt", isId: false, isUnique: false, seq })
    };
}

function definePasswordResetTokenFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends PasswordResetTokenFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): PasswordResetTokenFactoryInterface<TTransients, PasswordResetTokenTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly PasswordResetTokenTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("PasswordResetToken", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.PasswordResetTokenCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGeneratePasswordResetTokenScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<PasswordResetTokenFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<PasswordResetTokenFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isPasswordResetTokenuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.PasswordResetTokenCreateInput;
            const data: Prisma.PasswordResetTokenCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PasswordResetTokenCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: PasswordResetToken) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.PasswordResetTokenCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().passwordResetToken.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PasswordResetTokenCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.PasswordResetTokenCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "PasswordResetToken" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: PasswordResetTokenTraitKeys<TOptions>, ...names: readonly PasswordResetTokenTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface PasswordResetTokenFactoryBuilder {
    <TOptions extends PasswordResetTokenFactoryDefineOptions>(options: TOptions): PasswordResetTokenFactoryInterface<{}, PasswordResetTokenTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends PasswordResetTokenTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends PasswordResetTokenFactoryDefineOptions<TTransients>>(options: TOptions) => PasswordResetTokenFactoryInterface<TTransients, PasswordResetTokenTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link PasswordResetToken} model.
 *
 * @param options
 * @returns factory {@link PasswordResetTokenFactoryInterface}
 */
export const definePasswordResetTokenFactory = (<TOptions extends PasswordResetTokenFactoryDefineOptions>(options: TOptions): PasswordResetTokenFactoryInterface<TOptions> => {
    return definePasswordResetTokenFactoryInternal(options, {});
}) as PasswordResetTokenFactoryBuilder;

definePasswordResetTokenFactory.withTransientFields = defaultTransientFieldValues => options => definePasswordResetTokenFactoryInternal(options, defaultTransientFieldValues);

type RecoveryCodeScalarOrEnumFields = {
    codeHash: string;
};

type RecoveryCodeuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutRecoveryCodesInput["create"]>;
};

type RecoveryCodeFactoryDefineInput = {
    id?: string;
    createdAt?: Date;
    codeHash?: string;
    usedAt?: Date | null;
    user: RecoveryCodeuserFactory | Prisma.UserCreateNestedOneWithoutRecoveryCodesInput;
};

type RecoveryCodeTransientFields = Record<string, unknown> & Partial<Record<keyof RecoveryCodeFactoryDefineInput, never>>;

type RecoveryCodeFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<RecoveryCodeFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<RecoveryCode, Prisma.RecoveryCodeCreateInput, TTransients>;

type RecoveryCodeFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<RecoveryCodeFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: RecoveryCodeFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<RecoveryCode, Prisma.RecoveryCodeCreateInput, TTransients>;

function isRecoveryCodeuserFactory(x: RecoveryCodeuserFactory | Prisma.UserCreateNestedOneWithoutRecoveryCodesInput | undefined): x is RecoveryCodeuserFactory {
    return (x as any)?._factoryFor === "User";
}

type RecoveryCodeTraitKeys<TOptions extends RecoveryCodeFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface RecoveryCodeFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "RecoveryCode";
    build(inputData?: Partial<Prisma.RecoveryCodeCreateInput & TTransients>): PromiseLike<Prisma.RecoveryCodeCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.RecoveryCodeCreateInput & TTransients>): PromiseLike<Prisma.RecoveryCodeCreateInput>;
    buildList(list: readonly Partial<Prisma.RecoveryCodeCreateInput & TTransients>[]): PromiseLike<Prisma.RecoveryCodeCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.RecoveryCodeCreateInput & TTransients>): PromiseLike<Prisma.RecoveryCodeCreateInput[]>;
    pickForConnect(inputData: RecoveryCode): Pick<RecoveryCode, "id">;
    create(inputData?: Partial<Prisma.RecoveryCodeCreateInput & TTransients>): PromiseLike<RecoveryCode>;
    createList(list: readonly Partial<Prisma.RecoveryCodeCreateInput & TTransients>[]): PromiseLike<RecoveryCode[]>;
    createList(count: number, item?: Partial<Prisma.RecoveryCodeCreateInput & TTransients>): PromiseLike<RecoveryCode[]>;
    createForConnect(inputData?: Partial<Prisma.RecoveryCodeCreateInput & TTransients>): PromiseLike<Pick<RecoveryCode, "id">>;
}

export interface RecoveryCodeFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends RecoveryCodeFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): RecoveryCodeFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateRecoveryCodeScalarsOrEnums({ seq }: {
    readonly seq: number;
}): RecoveryCodeScalarOrEnumFields {
    return {
        codeHash: getScalarFieldValueGenerator().String({ modelName: "RecoveryCode", fieldName: "codeHash", isId: false, isUnique: false, seq })
    };
}

function defineRecoveryCodeFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends RecoveryCodeFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): RecoveryCodeFactoryInterface<TTransients, RecoveryCodeTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly RecoveryCodeTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("RecoveryCode", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.RecoveryCodeCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateRecoveryCodeScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<RecoveryCodeFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<RecoveryCodeFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isRecoveryCodeuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.RecoveryCodeCreateInput;
            const data: Prisma.RecoveryCodeCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.RecoveryCodeCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: RecoveryCode) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.RecoveryCodeCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().recoveryCode.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.RecoveryCodeCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.RecoveryCodeCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "RecoveryCode" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: RecoveryCodeTraitKeys<TOptions>, ...names: readonly RecoveryCodeTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface RecoveryCodeFactoryBuilder {
    <TOptions extends RecoveryCodeFactoryDefineOptions>(options: TOptions): RecoveryCodeFactoryInterface<{}, RecoveryCodeTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends RecoveryCodeTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends RecoveryCodeFactoryDefineOptions<TTransients>>(options: TOptions) => RecoveryCodeFactoryInterface<TTransients, RecoveryCodeTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link RecoveryCode} model.
 *
 * @param options
 * @returns factory {@link RecoveryCodeFactoryInterface}
 */
export const defineRecoveryCodeFactory = (<TOptions extends RecoveryCodeFactoryDefineOptions>(options: TOptions): RecoveryCodeFactoryInterface<TOptions> => {
    return defineRecoveryCodeFactoryInternal(options, {});
}) as RecoveryCodeFactoryBuilder;

defineRecoveryCodeFactory.withTransientFields = defaultTransientFieldValues => options => defineRecoveryCodeFactoryInternal(options, defaultTransientFieldValues);

type ContactFormSubmissionScalarOrEnumFields = {
    emailAddress: string;
    message: string;
};

type ContactFormSubmissionFactoryDefineInput = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    emailAddress?: string;
    message?: string;
};

type ContactFormSubmissionTransientFields = Record<string, unknown> & Partial<Record<keyof ContactFormSubmissionFactoryDefineInput, never>>;

type ContactFormSubmissionFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ContactFormSubmissionFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<ContactFormSubmission, Prisma.ContactFormSubmissionCreateInput, TTransients>;

type ContactFormSubmissionFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<ContactFormSubmissionFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: ContactFormSubmissionFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<ContactFormSubmission, Prisma.ContactFormSubmissionCreateInput, TTransients>;

type ContactFormSubmissionTraitKeys<TOptions extends ContactFormSubmissionFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface ContactFormSubmissionFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "ContactFormSubmission";
    build(inputData?: Partial<Prisma.ContactFormSubmissionCreateInput & TTransients>): PromiseLike<Prisma.ContactFormSubmissionCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ContactFormSubmissionCreateInput & TTransients>): PromiseLike<Prisma.ContactFormSubmissionCreateInput>;
    buildList(list: readonly Partial<Prisma.ContactFormSubmissionCreateInput & TTransients>[]): PromiseLike<Prisma.ContactFormSubmissionCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ContactFormSubmissionCreateInput & TTransients>): PromiseLike<Prisma.ContactFormSubmissionCreateInput[]>;
    pickForConnect(inputData: ContactFormSubmission): Pick<ContactFormSubmission, "id">;
    create(inputData?: Partial<Prisma.ContactFormSubmissionCreateInput & TTransients>): PromiseLike<ContactFormSubmission>;
    createList(list: readonly Partial<Prisma.ContactFormSubmissionCreateInput & TTransients>[]): PromiseLike<ContactFormSubmission[]>;
    createList(count: number, item?: Partial<Prisma.ContactFormSubmissionCreateInput & TTransients>): PromiseLike<ContactFormSubmission[]>;
    createForConnect(inputData?: Partial<Prisma.ContactFormSubmissionCreateInput & TTransients>): PromiseLike<Pick<ContactFormSubmission, "id">>;
}

export interface ContactFormSubmissionFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ContactFormSubmissionFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ContactFormSubmissionFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateContactFormSubmissionScalarsOrEnums({ seq }: {
    readonly seq: number;
}): ContactFormSubmissionScalarOrEnumFields {
    return {
        emailAddress: getScalarFieldValueGenerator().String({ modelName: "ContactFormSubmission", fieldName: "emailAddress", isId: false, isUnique: false, seq }),
        message: getScalarFieldValueGenerator().String({ modelName: "ContactFormSubmission", fieldName: "message", isId: false, isUnique: false, seq })
    };
}

function defineContactFormSubmissionFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends ContactFormSubmissionFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): ContactFormSubmissionFactoryInterface<TTransients, ContactFormSubmissionTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly ContactFormSubmissionTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("ContactFormSubmission", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.ContactFormSubmissionCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateContactFormSubmissionScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<ContactFormSubmissionFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<ContactFormSubmissionFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {} as Prisma.ContactFormSubmissionCreateInput;
            const data: Prisma.ContactFormSubmissionCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ContactFormSubmissionCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: ContactFormSubmission) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.ContactFormSubmissionCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().contactFormSubmission.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ContactFormSubmissionCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.ContactFormSubmissionCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "ContactFormSubmission" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: ContactFormSubmissionTraitKeys<TOptions>, ...names: readonly ContactFormSubmissionTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface ContactFormSubmissionFactoryBuilder {
    <TOptions extends ContactFormSubmissionFactoryDefineOptions>(options?: TOptions): ContactFormSubmissionFactoryInterface<{}, ContactFormSubmissionTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ContactFormSubmissionTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ContactFormSubmissionFactoryDefineOptions<TTransients>>(options?: TOptions) => ContactFormSubmissionFactoryInterface<TTransients, ContactFormSubmissionTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link ContactFormSubmission} model.
 *
 * @param options
 * @returns factory {@link ContactFormSubmissionFactoryInterface}
 */
export const defineContactFormSubmissionFactory = (<TOptions extends ContactFormSubmissionFactoryDefineOptions>(options?: TOptions): ContactFormSubmissionFactoryInterface<TOptions> => {
    return defineContactFormSubmissionFactoryInternal(options ?? {}, {});
}) as ContactFormSubmissionFactoryBuilder;

defineContactFormSubmissionFactory.withTransientFields = defaultTransientFieldValues => options => defineContactFormSubmissionFactoryInternal(options ?? {}, defaultTransientFieldValues);
