import { workspace } from 'vscode';
import fetch from 'node-fetch';
import { AbortController } from 'node-abort-controller';

export interface OsmosisRunResult {
    column_names: string[],
    rows: any[][],
    raw_sql: string,
    compiled_sql: string,
}

export interface OsmosisCompileResult {
    result: string
}

export interface OsmosisResetResult {
    result: string
}

export interface OsmosisRegisterResult {
    added: string
    projects: string[]
}

export interface OsmosisUnregisterResult {
    removed: string
    projects: string[]
}

export enum OsmosisFullReparse {
    True = "true",
    False = "false"
}

export enum OsmosisErrorCode {
    FailedToReachServer = -1,
    CompileSqlFailure = 1,
    ExecuteSqlFailure = 2,
    ProjectParseFailure = 3,
    ProjectNotRegistered = 4,
    ProjectHeaderNotSupplied = 5,
    SqlNotSupplied = 6
}

export interface OsmosisErrorContainer {
    error: {
        code: OsmosisErrorCode,
        message: string,
        data: { [index: string]: (string | number) },
    }
}

const failedToReachServerError: OsmosisErrorContainer = {
    error: {
        code: OsmosisErrorCode.FailedToReachServer,
        message: "Query failed to reach dbt sync server",
        data: {
            "error": `Is the server listening on http://${getHost()}:${getPort()} address?`,
        },
    }
};

export function getHost(): string {
    return workspace
        .getConfiguration("dbt.server")
        .get<string>("osmosisHost", "localhost");
}

export function getPort(): number {
    return workspace
        .getConfiguration("dbt.server")
        .get<number>("osmosisPort", 8581);
}

/** An entrypoint to execute a command against the osmosis server */
async function osmosisFetch<T>(dbtProjectPath: string, endpoint: string, args = {}, timeout: number = 25000) {
    const abortController = new AbortController();
    const timeoutHandler = setTimeout(() => {
        abortController.abort();
    }, timeout);
    let response;
    try {
        response = await fetch(
            `http://${getHost()}:${getPort()}/${endpoint}`,
            {
                method: "GET",
                ...args,
                signal: abortController.signal,
                headers: { "X-dbt-Project": dbtProjectPath }
            }
        );
    } catch (e) {
        console.log("Server Error");
        console.log(e);
        clearTimeout(timeoutHandler);
        return failedToReachServerError;
    };
    clearTimeout(timeoutHandler);
    return await response.json() as T;
}

/** Execute dbt SQL against a registered project as determined by X-dbt-Project header */
export async function runQuery(dbtProjectPath: string, query: string, limit: number = 200) {
    return await osmosisFetch<OsmosisRunResult | OsmosisErrorContainer>(
        dbtProjectPath,
        `run?limit=${limit}`,
        {
            method: "POST",
            headers: {
                "content-type": "text/plain",
            },
            body: query,
        }
    );
}

/** Compile dbt SQL against a registered project as determined by X-dbt-Project header */
export async function compileQuery(dbtProjectPath: string, query: string) {
    return await osmosisFetch<OsmosisCompileResult | OsmosisErrorContainer>(
        dbtProjectPath,
        "compile",
        {
            method: "POST",
            headers: {
                "content-type": "text/plain",
            },
            body: query,
        }
    );
}

/** Reparse a registered project on disk as determined by X-dbt-Project header writing
    manifest.json to target directory */
export async function reparseProject(
    dbtProjectPath: string,
    target: string | undefined = undefined,
    reset: OsmosisFullReparse = OsmosisFullReparse.False
) {
    let endpoint = `parse?reset=${reset}`;
    if (target) {
        endpoint += `&target=${encodeURIComponent(target)}`;
    }
    return await osmosisFetch<OsmosisResetResult | OsmosisErrorContainer>(
        dbtProjectPath,
        endpoint
    );
}

/** Register a new project. This will parse the project on disk and load it into memory */
export async function registerProject(dbtProjectPath: string, dbtProfilePath: string) {
    return await osmosisFetch<OsmosisRegisterResult | OsmosisErrorContainer>(
        dbtProjectPath,
        `register?project_dir=${encodeURIComponent(dbtProjectPath)}&profiles_dir=${encodeURIComponent(dbtProfilePath)}`,
        { method: "POST" }
    );
}

/** Unregister a project. This drop a project from memory */
export async function unregisterProject(dbtProjectPath: string) {
    return await osmosisFetch<OsmosisUnregisterResult | OsmosisErrorContainer>(
        dbtProjectPath,
        "unregister",
        { method: "POST" }
    );
}

/** Checks if the server is running and accepting requests */
export async function healthCheck(): Promise<boolean> {
    const abortController = new AbortController();
    const timeoutHandler = setTimeout(() => {
        abortController.abort();
    }, 1000);
    let response;
    try {
        response = await fetch(
            `http://${getHost()}:${getPort()}/health`,
            {
                method: "GET",
                signal: abortController.signal,
            }
        );
    } catch (e) {
        return false;
    };
    clearTimeout(timeoutHandler);
    return true;
}

export function isError(result: OsmosisErrorContainer
    | OsmosisRunResult
    | OsmosisCompileResult
    | OsmosisRegisterResult
    | OsmosisUnregisterResult
    | OsmosisResetResult): result is OsmosisErrorContainer {
    return (<OsmosisErrorContainer>result).error !== undefined;
}
