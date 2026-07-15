import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

/**
 * Type-level performance regression guard.
 *
 * Compiles a deliberately heavy fixture (deep + wide context, an ExpressionHandler
 * build, and a cross-context `or` assignment) with `tsc --extendedDiagnostics`, then
 * asserts that:
 *   1. It compiles with NO excessive-depth errors (TS2321 / TS2589). Reverting the
 *      `Path` materialization boundary to a ts-toolbelt-style implementation reproduces
 *      "Excessive stack depth comparing types 'Path<?, P>'" here.
 *   2. The instantiation count stays under a budget. The current baseline is ~321k; a
 *      regression to the old `Path` encoding balloons it to ~2M.
 *
 * This runs the real `tsc` in a child process so it works identically on Linux/macOS/Windows.
 */
describe('type instantiation benchmark', () => {
    // Baseline ~321k instantiations. Budget gives ~2x head-room for TS version drift while
    // still catching the ~2M regression that a ts-toolbelt-style Path would introduce.
    const INSTANTIATION_BUDGET = 700_000;

    it('compiles the heavy fixture without excessive-depth errors and under budget', () => {
        const repoRoot = path.resolve(__dirname, '..', '..');
        const tscPath = path.resolve(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
        const projectPath = path.resolve(__dirname, 'benchmark', 'tsconfig.json');
        expect(fs.existsSync(tscPath), `tsc not found at ${tscPath}`).toBe(true);

        let output: string;
        try {
            output = execFileSync(
                process.execPath,
                [tscPath, '-p', projectPath, '--extendedDiagnostics'],
                { encoding: 'utf8', cwd: repoRoot },
            );
        } catch (err) {
            const e = err as { stdout?: string; stderr?: string };
            const combined = `${e.stdout ?? ''}${e.stderr ?? ''}`;
            throw new Error(`tsc failed to compile the benchmark fixture:\n${combined}`);
        }

        expect(output, 'benchmark fixture produced TypeScript errors').not.toMatch(/error TS/);

        const match = output.match(/Instantiations:\s+(\d+)/);
        expect(match, `could not parse Instantiations from tsc output:\n${output}`).toBeTruthy();

        const instantiations = Number((match as RegExpMatchArray)[1]);
        expect(
            instantiations,
            `type instantiations (${instantiations}) exceeded budget (${INSTANTIATION_BUDGET}); ` +
            `a Path/RequireOnlyOne regression likely reintroduced excessive type expansion`,
        ).toBeLessThan(INSTANTIATION_BUDGET);
    }, 60_000);
});
